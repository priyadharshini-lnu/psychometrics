# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  module EndUser
    class NomineeSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).maybe(:hash?)
          required(:approval_status).maybe(:str?)
          required(:evaluator_nomination_status).maybe(:str?)
          required(:can_remove).maybe(:bool?)
          required(:evaluator).hash(UserSchema.schema(_, _))
          required(:relationship).maybe(RelationshipSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
