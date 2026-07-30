# frozen_string_literal: true

module Communications
  class AssessmentCenterBookingSummaryJob < ApplicationJob
    queue_as :communication
    retry_on StandardError, wait: ->(executions) { executions * 1.minute }, attempts: 3

    def perform(communication_id)
      communication = Communication.find_by(id: communication_id)
      return if communication.blank?

      communication.communications_users.find_each do |communication_user|
        CommunicationEmail.create(
          communication: communication,
          user: communication_user.user
        )
      end

      new_last_ran_at = Time.zone.now
      communication.update_column(:last_ran_at, new_last_ran_at)

      normalized_tz = TimezoneHelper.normalize(communication.delivery_timezone)
      last_run_date = new_last_ran_at.in_time_zone(normalized_tz).to_date
      communication.schedule_repeated_emails(job: Communications::AssessmentCenterBookingSummaryJob,
                                             last_run_date: last_run_date)
    end
  end
end
