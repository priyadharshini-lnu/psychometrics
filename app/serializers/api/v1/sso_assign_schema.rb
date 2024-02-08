# frozen_string_literal: true

module Api
  module V1
    class SsoAssignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:icon_url).maybe(:str?)
          required(:poster_url).maybe(:str?)
          required(:description).maybe(:str?)
          required(:campaign_id).filled(:int?)
          required(:name).filled(:str?)
          required(:url).filled(:str?)
          required(:status).maybe(:str?)
        end
      end
    end
  end
end
