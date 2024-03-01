# frozen_string_literal: true

module Campaigns
  module Users
    class Create < BaseCommand
      private_attr_reader :form, :campaign, :current_user, :project, :user, :campaign_user

      def initialize(form, campaign, current_user = nil)
        @form = form
        @campaign = campaign
        @project = campaign.project
        @current_user = current_user
      end

      def call
        transaction do
          create_campaign_user
          add_reports_and_assessments
          send_invite_email
        end
        broadcast :ok, user
      rescue Licenses::NotEnoughError => e
        broadcast :error, e.message
      end

      private

      def existing_user_in_project
        @existing_user_in_project ||= User.find_by(project_id: campaign.project_id, email: form.email)
      end

      def create_campaign_user # rubocop:disable Metrics/AbcSize
        if existing_user_in_project
          @user = existing_user_in_project
          if form.first_name.present? && form.last_name &&
             (@user.first_name != form.first_name || @user.last_name != form.last_name)
            @user.update!(first_name: form.first_name, last_name: form.last_name, modifier: current_user)
          end
        else
          ActiveRecord::Base.transaction do
            user_attributes = form.to_h.except(
              :operation, :campaign_ids, :active, :locale,
              :schedule_start_date, :schedule_start_date, :schedule_end_date
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
        @campaign_user = campaign.campaign_users.find_or_initialize_by(user: user)
        campaign_user.assign_attributes(
          active: form.active, schedule_start_date: form.schedule_start_date,
          schedule_end_date: form.schedule_end_date
        )
        campaign_user.save!
      end

      def add_reports_and_assessments
        campaign.campaign_reports.includes(:report).map do |campaign_report|
          next unless campaign_report.auto_assign?

          assessments = campaign_report.report.assessments.joins(:campaign_assessments).where(campaign_assessments: {
            campaign_id: campaign.id, auto_assign: true
          })

          Campaigns::Users::AddReport.call!(
            campaign_user,
            campaign_report.report,
            current_user: current_user || user,
            report_family_id: campaign_report.report_family_id,
            user_access: campaign_report.user_access,
            operation: form.operation,
            assessments: assessments
          )
        end
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
