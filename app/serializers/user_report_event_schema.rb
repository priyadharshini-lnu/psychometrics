# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class UserReportEventSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:event_type).filled(:str?)
      required(:details).filled(:str?)
      required(:created_at).filled(:str?)
      required(:initiator).hash(ShortUserSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
