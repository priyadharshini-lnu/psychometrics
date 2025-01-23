# frozen_string_literal: true

module Reports
  class CampaignFactorSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:code).filled(:str?)
        required(:output_type).filled(:str?)
      end
    end
  end
end
