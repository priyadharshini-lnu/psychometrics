# frozen_string_literal: true

module EndUser
  class BookingsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true
        required(:id).filled(:int?)
        required(:title).filled(:str?)
        required(:description).filled(:str?)
        required(:duration).maybe(:int?)
        required(:status).maybe(:str?)
        required(:workshop_invite_id).maybe(:int?)
        required(:date).maybe(:str?)
        required(:timezone).maybe(:str?)
        required(:cancellation_lead_time).filled(:int?)
        required(:reason).maybe(:str?)
      end
    end
  end
end
