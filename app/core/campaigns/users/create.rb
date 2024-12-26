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
          add_reports_and_assessments
          send_invite_email
        end
        broadcast :ok, user
      rescue Licenses::NotEnoughError => e
        broadcast :insufficient_license, e.message
      end

      private

      def create_or_update_user
        if user
          if form.first_name.present? && form.last_name && (
            @user.first_name != form.first_name || @user.last_name != form.last_name
          )
            @user.update!(first_name: form.first_name, last_name: form.last_name, modifier: current_user)
          end
        else
          ActiveRecord::Base.transaction do
            user_attributes = form.to_h.except(
              :operation, :campaign_ids, :active, :locale,
              :schedule_start_date, :schedule_start_date, :schedule_end_date, :external_id
            ).merge(
              project: project,
              create_by_invite: true,
              creator: current_user,
              modifier: current_user
            )
            @user = User.create!(user_attributes)
            @user.user_profile.update(locale: form.locale)
            AuditLogModule.audit!(
              :create, user, user: current_user, campaign: campaign, payload: form.attributes
            )
          end
        end
      end

      def create_or_update_campaign_user
        @campaign_user = campaign.campaign_users.find_or_initialize_by(user: user)
        attributes = {
          active: form.active,
          schedule_start_date: form.schedule_start_date,
          schedule_end_date: form.schedule_end_date
        }
        attributes[:external_id] = form.external_id if form.respond_to?(:external_id)
        campaign_user.assign_attributes(attributes)
        campaign_user.save!
      end

      def add_reports_and_assessments
        Campaigns::Users::AddAssignableReportsAndAssessments.call!(
          campaign, campaign_user, current_user || user, operation: form.operation
        )
      end

      def send_invite_email
        communication = Communication.new_users_recipients.order(created_at: :desc).find_by(campaign: campaign)
        return communication.emails.create(campaign_user_id: campaign_user.id) if communication

        if through_registration?
          raw_token = ::Users::FindOrCreateInvitationToken.call!(user)
          InvitationMailer.invite(user.id, user.project_id, raw_token).deliver_later
        end
      end

      def through_registration?
        current_user.nil?
      end
    end
  end
end
