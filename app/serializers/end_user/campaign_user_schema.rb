# frozen_string_literal: true

module EndUser
  class CampaignUserSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:started_at) { str? | none? }
        required(:status).maybe(:str?)
        required(:expiry_date) { str? | none? }
        required(:examus_session_url).maybe(:str?)
        required(:all_preworks_completed).maybe(:bool?)
      end
    end
  end
end
