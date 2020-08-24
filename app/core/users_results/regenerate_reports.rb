# frozen_string_literal: true

module UsersResults
  class RegenerateReports < BaseCommand
    private_attr_reader :user_result, :campaign, :current_user

    def initialize(user_result, campaign, current_user)
      @user_result = user_result
      @campaign = campaign
      @current_user = current_user
    end

    def call
      UserReport.where(
        report_id: user_result.assessment.report_ids,
        user_id: user_result.subject_id,
        campaign_id: campaign.id,
        status: %i[generating prepared]
      ).each do |user_report|
        UserReports::GeneratePdfJob.perform_now(user_report, current_user)
      end

      broadcast :ok
    end
  end
end
