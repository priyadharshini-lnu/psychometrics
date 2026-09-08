# frozen_string_literal: true

module ProctoringSessions
  class MarkInvalid < BaseCommand
    private_attr_reader :proctoring_session

    def initialize(proctoring_session)
      @proctoring_session = proctoring_session
    end

    def call
      return broadcast :ok if proctoring_session.invalid_session?

      license_usage = proctoring_session.license_usage
      ProctoringSession.transaction do
        proctoring_session.update!(invalid_session: true)
        # UAT usage never incremented the billable counter, so it must not decrement it.
        unless license_usage&.is_uat?
          license_usage&.license&.decrement!(:used_number, license_usage.proctoring_credits_debited)
        end
      end

      broadcast :ok
    end
  end
end
