# frozen_string_literal: true

module Administration
  class MicrositeUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:participant_id).maybe(:str?)
        required(:registration_status).maybe(:str?)
        required(:error_message).maybe(:str?)
        required(:raw_response).maybe(:hash?)
      end
    end
  end
end
