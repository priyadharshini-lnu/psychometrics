# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module EndUser
  class AIAssistedUserSessionSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        optional(:error).maybe(:str?)
        required(:messages).array(EndUser::IdpAIChatMessageSchema.schema(_, _))
        optional(:meta).maybe(:hash?)
        optional(:checkpoint).maybe(:str?)
        required(:status).filled(:str?)
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
