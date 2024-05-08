# frozen_string_literal: true

class CampaignOptionsLocaleSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:instructions).maybe(:str?)
      required(:locale).filled(:str?)
    end
  end
end
