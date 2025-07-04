# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module EndUser
  class UserIdpCommentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:content).filled(:str?)
        required(:created_at).filled(:str?)
        required(:created_by).filled(UserSchema.schema(_, _))
        required(:resource_id).maybe(:int?)
        required(:resource_type).maybe(:str?)
        required(:replies_count).filled(:int?)
        required(:edited).filled(:bool?)
        required(:unread_replies_count).filled(:int?)
        required(:resolved_by).maybe(UserSchema.schema(_, _))
        required(:replies).maybe(:array?)
        required(:parent_id).maybe(:int?)
        required(:resolved_at).maybe(:str?)
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
