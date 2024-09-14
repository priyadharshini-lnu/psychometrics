# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  module EndUser
    class ManagedSubjectSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:campaign_id).filled(:int?)
          required(:evaluators).hash(UserSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
