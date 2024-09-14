# frozen_string_literal: true

module Threesixty
  class CampaignDetailsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:options).hash do
          required(:can_approves_evaluations).filled(:bool?)
        end
        required(:evaluators).array do
          hash do
            required(:relationship).filled(:str?)
            required(:manager_evaluation_status).filled(:str?)
            required(:status).maybe(:bool?)
          end
        end
      end
    end
  end
end
