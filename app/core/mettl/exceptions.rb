# frozen_string_literal: true

module Mettl
  module Exceptions
    class CreateScheduleFailed < StandardError; end
    class DeleteCandidateResultFailed < StandardError; end
    class EditAssessmentFailed < StandardError; end
    class EditScheduleFailed < StandardError; end
    class GetScoresFailed < StandardError; end
    class RegisterCandidateFailed < StandardError; end
  end
end
