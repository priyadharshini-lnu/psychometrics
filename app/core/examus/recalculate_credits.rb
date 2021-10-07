# frozen_string_literal: true

module Examus
  class RecalculateCredits < BaseCommand
    private_attr_reader :proctoring_session

    MIN_CREDIT = 3
    SECS_IN_MIN = 60
    MINUTES_STEP = 15

    def initialize(proctoring_session)
      @proctoring_session = proctoring_session
    end

    def call
      broadcast :ok unless proctoring_session

      license_usage = proctoring_session.license_usage
      seconds = (proctoring_session.completed_at - proctoring_session.started_at).to_i
      credits = MIN_CREDIT + mins_to_credits(seconds / SECS_IN_MIN)
      license_usage.update(proctoring_credits_credited: credits, proctoring_session_duration: seconds)
      diffrence = license_usage.proctoring_credits_debited - license_usage.proctoring_credits_credited
      license_usage.license.update!(used_number: license_usage.license.used_number - diffrence) if diffrence.positive?

      broadcast :ok
    end

    private

    def mins_to_credits(mins)
      mins < MINUTES_STEP ? 0 : ((mins - MINUTES_STEP) / MINUTES_STEP.to_f).ceil
    end
  end
end
