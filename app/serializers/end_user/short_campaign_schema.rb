# frozen_string_literal: true

module EndUser
  class ShortCampaignSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:name).filled(:string)
        required(:type).filled(:string)
        required(:status).filled(:string)
        required(:completion_percentage).filled(:float)
        required(:progress_status).filled(:string)
        required(:user_reports_available).filled(:bool)
        required(:description).maybe(:string)
        required(:timing).maybe(:string)
        required(:scheduled_at).maybe(:string)
        required(:scheduled_in).maybe(:float)
      end
    end
  end
end
