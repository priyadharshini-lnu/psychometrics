# frozen_string_literal: true

module Administration
  module Assessors
    class UserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:email).filled(:str?)
          required(:full_name).filled(:str?)
          required(:total_evaluations).maybe(:int?)
          required(:completed_evaluations).filled(:int?)
          required(:completion_status).filled(:str?)
          required(:permissions).hash do
            required(:add_subject).filled(:bool?)
            required(:remove_subject).filled(:bool?)
          end
        end
      end
    end
  end
end
