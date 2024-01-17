# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:email).filled(:str?)
          required(:full_name).filled(:str?)
          required(:created_by).maybe(:str?)
          required(:updated_by).maybe(:str?)
          required(:created_at).filled(:str?)
          required(:updated_at).filled(:str?)
          required(:locale).maybe(:str?)
          required(:active).filled(:bool?)
          required(:completion_status).filled(:str?)
          required(:status).filled(:str?)
          required(:permissions).hash do
            required(:edit).filled(:bool?)
            required(:login_as).filled(:bool?)
            required(:reset_password).filled(:bool?)
            required(:remove).filled(:bool?)
          end
          required(:started_at).maybe(:str?)
          required(:completed_at).maybe(:str?)
        end
      end
    end
  end
end
