# frozen_string_literal: true

module Campaigns
  module Users
    class AddAssignableReportsAndAssessments < BaseCommand
      private_attr_reader :user, :campaign, :campaign_user, :options

      def initialize(campaign, campaign_user, user, options = {})
        @campaign = campaign
        @campaign_user = campaign_user
        @user = user
        @options = options
      end

      def call
        campaign.campaign_reports.includes(:report).map do |campaign_report|
          next unless campaign_report.auto_assign?

          assessments = campaign_report.report.assessments.joins(:campaign_assessments).where(campaign_assessments: {
            campaign_id: campaign.id, auto_assign: true
          })

          Campaigns::Users::AddReport.call!(
            campaign_user,
            campaign_report.report,
            current_user: user,
            report_family_id: campaign_report.report_family_id,
            user_access: campaign_report.user_access,
            operation: options[:operation] || 'add_and_allow_new_response',
            assessments: assessments
          )
        end
        broadcast :ok
      end
    end
  end
end
