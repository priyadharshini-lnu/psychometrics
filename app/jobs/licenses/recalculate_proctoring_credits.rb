# frozen_string_literal: true

module Licenses
  class RecalculateProctoringCredits < ApplicationJob
    queue_as :default

    def perform
      ProctoringSession.valid_sessions.where(
        "results = '{}' AND (last_status_checked_at IS NULL OR last_status_checked_at < ?)", 30.minutes.ago
      ).find_each do |ps|
        ProctoringSessions::MarkInvalid.call!(ps) if Examus::GetSession.call!(ps.session_id).nil?
        ps.update!(last_status_checked_at: Time.now)
      end
    end
  end
end
