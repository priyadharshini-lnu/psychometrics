# frozen_string_literal: true

module CampaignReports
  class GenerateAndSavePdfJob < ApplicationJob
    queue_as :reports

    def perform(campaign_reports, current_user, options = {})
      user_report_ids = campaign_reports.map do |cr|
        cr.user_reports.ids
      end.flatten

      ::UserReports::GenerateAndSavePdfJob.perform_later(
        user_report_ids,
        current_user,
        options
      )
    end
  end
end
