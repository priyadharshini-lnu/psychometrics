# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Api
  module V1
    class UserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = false

          required(:id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:user_external_id).maybe(:str?)
          required(:email).filled(:str?)
          required(:created_at).filled(:str?)
          required(:updated_at).filled(:str?)
          required(:campaigns).array do
            schema(Api::V1::UserCampaignSchema.schema(_, _))
          end
          required(:campaign_ids).maybe(:array?)
          optional(:project_datasheet).maybe(:hash?)
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
