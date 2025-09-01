# frozen_string_literal: true

module UserReports
  class ScheduleReportAvailableNotificationJob < ApplicationJob
    queue_as :reports

    def perform(campaign_id, report_id)
      user_reports = UserReport.where(campaign_id: campaign_id, report_id: report_id, user_access: true,
                                      status: 'prepared')

      return if user_reports.empty?

      notified_user_ids = CommunicationEmail.joins(:communication, :communication_email_resources).
                          where(communications: { kind: :report_available,
                                                  campaign_id: campaign_id }).
                          where(communication_email_resources: { resource_type: 'UserReport',
                                                                 resource_id: report_id }).
                          pluck(:user_id)

      user_reports_to_notify = user_reports.where.not(user_id: notified_user_ids)

      user_reports_to_notify.find_each(&:schedule_report_available_notification)
    end
  end
end
