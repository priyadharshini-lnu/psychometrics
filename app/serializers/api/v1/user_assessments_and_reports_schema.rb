# frozen_string_literal: true

module Api
  module V1
    class UserAssessmentsAndReportsSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:reports).array do
            schema do
              required(:id).filled(:int?)
              required(:report_bundle_id).filled(:int?)
              required(:user_access).filled(:bool?)
            end
          end

          required(:assessments).array do
            schema do
              required(:id).filled(:int?)
              required(:norm_id).maybe(:int?)
            end
          end
        end
      end
    end
  end
end
