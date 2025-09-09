# frozen_string_literal: true

module AI
  class CampaignArtifactResultSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:code).filled(:str?)
        required(:name).filled(:str?)
        required(:results).array do
          schema do
            required(:key).filled(:str?)
            required(:value).maybe(:str?)
          end
        end
      end
    end
  end
end
