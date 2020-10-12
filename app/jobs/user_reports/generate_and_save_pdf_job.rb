# frozen_string_literal: true

module UserReports
  class GenerateAndSavePdfJob < ApplicationJob
    queue_as :reports

    def perform(user_report_ids, current_user, options = {})
      ::UserReports::GenerateAndSavePdf.call!(
        UserReport.where(id: user_report_ids),
        current_user,
        options
      )
    end
  end
end
