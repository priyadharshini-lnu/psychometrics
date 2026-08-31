# frozen_string_literal: true

module Campaigns
  module Users
    class Create < BaseCommand
      private_attr_reader :form, :campaign, :current_user, :project, :campaign_user, :user

      def initialize(form, campaign, current_user = nil, user: nil)
        @form = form
        @campaign = campaign
        @project = campaign.project
        @current_user = current_user
        @user = user || User.find_by(project_id: campaign.project_id, email: form.email)
      end

      def call
        transaction do
          create_or_update_user
          create_or_update_campaign_user
          create_or_update_datasheet
          add_reports_and_assessments
          assign_idp_plan
          send_invite_email
        end
        broadcast :ok, user
      rescue Hogan::Exceptions::NewAssessmentResponseNotAllowed => e
        broadcast :new_assessment_response_not_allowed, e.message
      rescue Licenses::NotEnoughError => e
        broadcast :insufficient_license, e.message
      end

      private

      def create_or_update_datasheet
        return unless form.respond_to?(:datasheet) && form.datasheet.present?

        ::SheetRows::UpsertData.call(campaign.campaign_datasheet, form.email, form.datasheet)
      end

      def create_or_update_user
        if user
          update_user_if_changed
        else
          ActiveRecord::Base.transaction do
            user_attributes = form.to_h.except(
              :operation, :campaign_ids, :active, :locale, :gender,
              :schedule_start_date, :schedule_start_date, :schedule_end_date, :user_external_id,
              :campaign_user_external_id, :datasheet, :current_job_role, :target_job_role, :level
            ).merge(
              project: project,
              create_by_invite: true,
              creator: current_user,
              modifier: current_user,
              external_id: form.try(:user_external_id)
            )
            @user = User.create!(user_attributes)
            @user.user_profile.update(locale: form.locale, gender: form.try(:gender))
            AuditLogModule.audit!(
              :create, user, user: current_user, campaign: campaign, payload: form.attributes
            )
          end
        end
      end

      def create_or_update_campaign_user
        @campaign_user = campaign.campaign_users.find_or_initialize_by(user: user)
        @user_exists_in_campaign = @campaign_user.persisted?

        attributes = {
          active: form.active,
          schedule_start_date: form.schedule_start_date,
          schedule_end_date: form.schedule_end_date,
          current_job_role: find_job_role(form[:current_job_role]),
          target_job_role: find_job_role(form[:target_job_role]),
          level: form[:level]
        }
        attributes[:external_id] = form.campaign_user_external_id if form.respond_to?(:campaign_user_external_id)
        campaign_user.assign_attributes(attributes)
        campaign_user.save!
      end

      def add_reports_and_assessments
        Campaigns::Users::AddAssignableReportsAndAssessments.call!(
          campaign, campaign_user, current_user || user, operation: form.operation
        )
      end

      def update_user_if_changed
        return if form.first_name.blank? || form.last_name.blank?

        changes = { first_name: form.first_name, last_name: form.last_name }
        changes[:external_id] = form.user_external_id if form.respond_to?(:user_external_id)
        @user.assign_attributes(changes)
        if @user.changed?
          @user.modifier = current_user
          @user.save!
          AuditLogModule.audit!(:update, @user, user: current_user, campaign: campaign, payload: changes)
        end
        @user.user_profile.update!(gender: form.gender) if form.try(:gender).present?
      end

      def assign_idp_plan
        return unless campaign.campaign_idp&.automatically_assign_new
        return unless campaign.campaign_idp&.idp_template_id

        Idp::AssignUserIdp.call!(user, campaign.campaign_idp.idp_template_id, campaign.id, current_user)
      end

      def send_invite_email
        return if @user_exists_in_campaign

        communication = Communication.new_users_recipients.
                        order(created_at: :desc).
                        find_by(campaign: campaign, kind: :invitation)
        return communication.emails.create(campaign_user_id: campaign_user.id) if communication

        delivery = new_users_communication_delivery
        if delivery
          return CommunicationEmail.create!(communication_delivery: delivery, campaign_user: campaign_user,
                                            user: user)
        end

        if through_registration?
          raw_token = ::Users::FindOrCreateInvitationToken.call!(user)
          InvitationMailer.invite(user.id, user.project_id, raw_token).deliver_later
        end
      end

      def new_users_communication_delivery
        return unless project.client.feature_enabled?(:use_new_communication_center)

        CommunicationDelivery.joins(:communication_template).
          where(campaign_id: campaign.id, recipients: :new_users, communication_templates: { kind: 'invitation' }).
          where.not(status: %i[cancelled failed]).
          order(created_at: :desc).first
      end

      def through_registration?
        current_user.nil?
      end

      def find_job_role(role_name)
        return nil if role_name.blank?

        JobRole.find_by(name: role_name, project_id: project.id)
      end
    end
  end
end
