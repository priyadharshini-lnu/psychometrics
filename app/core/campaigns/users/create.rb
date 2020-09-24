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
        broadcast :error, { base: e.message }
      end

      private

      def existing_user_in_project
        @existing_user_in_project ||= User.find_by(project_id: campaign.project_id, email: form.email)
      end

      def create_campaign_user
        if existing_user_in_project
          @user = existing_user_in_project
        else
          user_attributes = form.attributes.except(:operation).merge(
            project: project,
            create_by_invite: true,
            creator: current_user,
            modifier: current_user
          )
          @user = User.create!(user_attributes)
        end
        @campaign_user = campaign.campaign_users.create(user: user)
      end

      def add_reports_and_assessments
        campaign.campaign_reports.includes(:report).map do |campaign_report|
          Campaigns::Users::AddReport.call!(
            campaign_user,
            campaign_report.report,
            report_family_id: campaign_report.report_family_id,
            user_access: campaign_report.user_access,
            operation: form.operation,
            use_license: use_new_license?(campaign_report.report)
          )
        end
      end

      def use_new_license?(report)
        return true unless existing_user_in_project
        return true if form.operation == 'add_and_allow_new_response'

        !Licenses::IsUsedByUser.call!(user, report)
      end

      def send_invite_email
        communication = Communication.new_users_recipients.order(created_at: :desc).find_by(campaign: campaign)
        return communication.emails.create(campaign_user_id: id) if communication

        if throught_registration?
          raw_token = ::Users::FindOrCreateInvitationToken.call!(user)
          InvitationMailer.invite(user.id, user.project_id, raw_token).deliver_later
        end
      end

      def throught_registration?
        current_user.nil?
      end
    end
  end
end
