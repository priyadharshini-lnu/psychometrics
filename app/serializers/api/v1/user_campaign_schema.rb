# frozen_string_literal: true

module Api
  module V1
    class UserCampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = false

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:created_at).maybe(:str?)
          required(:updated_at).maybe(:str?)
          required(:campaign_user_external_id).maybe(:str?)
          required(:active).filled(:bool?)
          required(:schedule_start_date).maybe(:str?)
          required(:schedule_end_date).maybe(:str?)
          optional(:datasheet).maybe(:hash?)
        end
      end
    end
  end
end
