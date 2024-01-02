# frozen_string_literal: true

module Api
  module V1
    class CampaignAssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:norm_id).maybe(:int?)
        end
      end
    end
  end
end
