# frozen_string_literal: true

module Administration
  class SavilleUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:data_seprator).maybe(:str?)
        required(:candidate_id).maybe(:str?)
        required(:participant_id).maybe(:str?)
      end
    end
  end
end
