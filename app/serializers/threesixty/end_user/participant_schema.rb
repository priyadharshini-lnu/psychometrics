# frozen_string_literal: true

module Threesixty::EndUser
  class ParticipantSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:evaluator_nomination_status).filled(:str?)
        required(:manager_evaluation_status).filled(:str?)
      end
    end
  end
end
