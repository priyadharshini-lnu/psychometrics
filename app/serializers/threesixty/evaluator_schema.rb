# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  class EvaluatorSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:report_status).maybe(:str?)
        required(:is_subject).filled(:bool?)
        required(:evaluations).filled(:str?)
        required(:evaluators).maybe(:str?)
        required(:permissions).hash do
          required(:login).filled(:bool?)
          required(:edit).filled(:bool?)
          required(:remove_from_campaign).filled(:bool?)
          required(:allow_results_delete).filled(:bool?)
        end
        required(:user).hash(UserSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
