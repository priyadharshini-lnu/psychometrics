# frozen_string_literal: true

module Simulation
  module Exceptions
    class RegisterParticipantFailed < StandardError; end
    class DeleteParticipantsFailed < StandardError; end

    class GetDecisionsFailed < StandardError; end
  end
end
