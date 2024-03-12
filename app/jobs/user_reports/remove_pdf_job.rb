# frozen_string_literal: true

module UserReports
  class RemovePdfJob < ApplicationJob
    queue_as :reports

    def perform(user_report_ids)
      UserReport.where(id: user_report_ids).find_each(&:remove_pdf_and_update_status!)
    end
  end
end
