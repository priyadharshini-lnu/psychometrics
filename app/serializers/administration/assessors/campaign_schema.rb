# frozen_string_literal: true

module Administration
  module Assessors
    class CampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:start_date).maybe(:str?)
          required(:end_date).maybe(:str?)
          required(:status).filled(:str?)
          required(:completion_status).filled(:str?)
          required(:completed_subject_count).filled(:int?)
          required(:total_subject_count).filled(:int?)
        end
      end
    end
  end
end
