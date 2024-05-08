# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class UserReportCommentSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:text).filled(:str?)
      required(:parent_id).maybe(:str?)
      required(:module_id).filled(:str?)
      required(:created_at).filled(:str?)
      required(:resolved).filled(:bool?)
      required(:creator).hash(ShortUserSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
