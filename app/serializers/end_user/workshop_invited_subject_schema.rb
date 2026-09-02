# frozen_string_literal: true

module EndUser
  class WorkshopInvitedSubjectSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:title).maybe(:str?)
        required(:description).maybe(:str?)
        required(:duration).filled(:int?)
        required(:status).filled(:str?)
        required(:workshop_invite_id).filled(:int?)

        required(:slots_count).filled(:int?)
        required(:seats_available).filled(:int?)
        required(:meeting_type).maybe(:str?)
        required(:upcoming_slot_date).maybe(:str?)
      end
    end
  end
end
