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
      end
    end
  end
end
