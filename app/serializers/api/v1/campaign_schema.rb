# frozen_string_literal: true

module Api
  module V1
    class CampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:status).filled(:str?)
          required(:start_date).maybe(:str?)
          required(:end_date).maybe(:str?)
          required(:fixed_time).filled(:bool?)
          required(:duration).maybe(:int?)
          required(:enable_instructions).filled(:bool?)
          required(:instructions).maybe(:str?)
          required(:created_at).filled(:str?)
          required(:updated_at).filled(:str?)
          required(:description).maybe(:str?)
        end
      end
    end
  end
end
