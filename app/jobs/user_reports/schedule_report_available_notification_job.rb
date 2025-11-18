# frozen_string_literal: true

module UserReports
  class ScheduleReportAvailableNotificationJob < ApplicationJob
    queue_as :reports

    def perform(user_report_ids)
      UserReport.where(id: user_report_ids).find_each do |user_report|
        next unless user_report.can_notify_report_availablity?

        user_report.schedule_report_available_notification
      end
    end
  end
end
