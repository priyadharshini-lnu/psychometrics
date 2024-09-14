# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  module EndUser
    class CampaignNomineeSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = false

          required(:id).filled(:int?)
          required(:is_self).filled(:bool?)
          required(:campaign_id).filled(:int?)
          required(:counters).filled(:hash?)
          required(:is_nomination_completed).filled(:bool?)
          required(:user).hash(UserSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
