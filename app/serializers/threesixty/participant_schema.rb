# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  class ParticipantSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:manager_nomination_status).filled(:str?)
        required(:evaluation_status).filled(:str?)
        required(:manager_evaluation_status).filled(:str?)
        required(:subject).maybe(UserSchema.schema(_, _))
        required(:evaluator).maybe(UserSchema.schema(_, _))
        required(:relationship).maybe(RelationshipSchema.schema(_, _))
        required(:result).maybe(Threesixty::ResultSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
