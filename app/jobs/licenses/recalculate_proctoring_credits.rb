# frozen_string_literal: true

module Licenses
  class RecalculateProctoringCredits < ApplicationJob
    queue_as :default

    def perform
      ProctoringSession.valid_sessions.where(
        "results = '{}' AND created_at < :time AND
        (last_status_checked_at IS NULL OR last_status_checked_at < :time)",
        time: 30.minutes.ago
      ).find_each do |ps|
        status_response = Examus::GetSession.call!(ps.session_id)
        if status_response.nil? || status_response['status'] == 'late_to_start'
          ProctoringSessions::MarkInvalid.call!(ps)
        end
        ps.update!(last_status_checked_at: Time.zone.now)
      end
    end
  end
end
