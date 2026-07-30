# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:full_name).filled(:str?)
          required(:email).filled(:str?)
          required(:permissions).hash do
            required(:remove).filled(:bool?)
            required(:login_as).filled(:bool?)
          end
          required(:status).filled(:str?)
          required(:total_evaluations).filled(:int?)
          required(:completed_evaluations).filled(:int?)
          required(:workshop_assessors_count).filled(:int?)
        end
      end
    end
  end
end
