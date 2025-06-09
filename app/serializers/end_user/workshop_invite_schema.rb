# frozen_string_literal: true

module EndUser
  class WorkshopInviteSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:title).filled(:str?)
        required(:description).maybe(:str?)
        required(:duration).filled(:int?)
        required(:total_invites).filled(:int?)
        required(:campaign_assessment_group_id).filled(:int?)
      end
    end
  end
end
