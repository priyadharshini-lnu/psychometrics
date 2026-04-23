# frozen_string_literal: true

module SystemCheckSessions
  class GetLastSuccessfulCheckAt < Rectify::Query
    private_attr_reader :campaign_user

    def initialize(campaign_user:)
      @campaign_user = campaign_user
    end

    def query
      session = find_last_successful_session
      session&.finished_at&.to_i
    end

    private

    def find_last_successful_session
      completed_sessions.find do |session|
        status_checker = GetSystemCheckStatus.new(
          session_id: session.id, campaign_user: campaign_user, skip_validity_check: true
        )
        status_checker.satisfied? || campaign.allow_continue_with_warning?
      end
    end

    def campaign
      @campaign ||= campaign_user.campaign
    end

    def completed_sessions
      campaign_user.user.
        system_check_sessions.
        completed.
        includes(:system_check_records).
        order(finished_at: :desc)
    end
  end
end
