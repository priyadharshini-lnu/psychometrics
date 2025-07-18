# frozen_string_literal: true

module Skillvue
  module Exceptions
    class InviteCandidateFailed < StandardError; end
    class GetAssessmentsFailed < StandardError; end
    class SubscribeToWebhookFailed < StandardError; end
    class GetScoresAndReportFailed < StandardError; end
  end
end
