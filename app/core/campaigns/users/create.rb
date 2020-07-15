# frozen_string_literal: true

module Campaigns
  module Users
    class Create < BaseCommand
      private_attr_reader :form, :campaign, :current_user, :project, :user, :campaigns_user

      def initialize(form, campaign, current_user)
        @form = form
        @campaign = campaign
        @project = campaign.project
        @current_user = current_user
      end

      def call
        transaction do
          create_campaigns_user
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

      def create_campaigns_user
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
        @campaigns_user = campaign.campaigns_users.create(user: user)
      end

      def add_reports_and_assessments
        campaign.campaigns_reports.includes(:report).map do |campaigns_report|
          Campaigns::Users::AddReport.call!(
            campaigns_user,
            campaigns_report.report,
            user_access: campaigns_report.user_access,
            operation: form.operation,
            use_license: use_new_license?(campaigns_report.report)
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
        communication&.emails&.create(campaign_user_id: id)
      end
    end
  end
end
