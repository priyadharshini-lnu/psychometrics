# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  class EmailScheduleSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:recipient).filled(:str?)
        required(:subject).filled(:str?)
        required(:scheduled_date).filled(:str?)
        required(:emails_sent).filled(:str?)
        required(:delivered_at).filled(:str?)
        required(:histories).array(Threesixty::EmailHistorySchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
