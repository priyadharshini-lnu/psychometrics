# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  module Memberships
    class WithGrantsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:user_id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:email).filled(:str?)
          required(:created_at).filled(:str?)
          required(:grants).schema(MembershipGrantsSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
