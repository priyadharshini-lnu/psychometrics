# frozen_string_literal: true

module Api
  module V1
    class CampaignReportSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:report_family_id).filled(:int?)
          required(:user_access).filled(:bool?)
          required(:assessor_access).filled(:bool?)
        end
      end
    end
  end
end
