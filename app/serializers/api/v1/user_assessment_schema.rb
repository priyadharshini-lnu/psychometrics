# frozen_string_literal: true

module Api
  module V1
    class UserAssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:description).maybe(:str?)
          required(:icon_url).maybe(:str?)
          required(:poster_url).maybe(:str?)
          required(:status).filled(:str?)
          required(:started_at).maybe(:str?)
          required(:completed_at).maybe(:str?)
          required(:campaign_id).filled(:int?)
          required(:norm_id).maybe(:int?)
        end
      end
    end
  end
end
