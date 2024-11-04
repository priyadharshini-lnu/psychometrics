# frozen_string_literal: true

module Api
  module V1
    class CampaignUserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:schedule_start_date).maybe(:str?)
          required(:schedule_end_date).maybe(:str?)
          required(:created_at).maybe(:str?)
          required(:updated_at).maybe(:str?)
        end
      end
    end
  end
end
