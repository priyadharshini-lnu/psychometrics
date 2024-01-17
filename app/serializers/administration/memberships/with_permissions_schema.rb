# frozen_string_literal: true

module Administration
  module Memberships
    class WithPermissionsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:user_id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:email).maybe(:str?)
          required(:created_at).maybe(:str?)
          required(:permissions).hash do
            required(:loginAs).filled(:bool?)
            required(:edit).filled(:bool?)
            required(:remove).filled(:bool?)
            required(:resetPassword).filled(:bool?)
            required(:sendMail).filled(:bool?)
          end
        end
      end
    end
  end
end
