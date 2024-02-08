# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  module Memberships
    class WithGrantsAndPermissionsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:user_id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:email).maybe(:str?)
          required(:created_at).maybe(:str?)
          required(:campaigns).array do
            hash do
              required(:id).filled(:int?)
              required(:name).filled(:str?)
            end
          end
          required(:permissions).hash do
            required(:loginAs).filled(:bool?)
            required(:edit).filled(:bool?)
            required(:remove).filled(:bool?)
            required(:resetPassword).filled(:bool?)
            required(:sendMail).filled(:bool?)
          end
          required(:grants).schema(MembershipGrantsSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
