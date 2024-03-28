# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:user_idp_skill_id).filled(:int?)
        required(:development_action_id).maybe(:int?)
        required(:name).maybe(:str?)
        required(:description).maybe(:str?)
        required(:custom_action).maybe(:str?)
        required(:private).filled(:bool?)
        required(:progress).value { int? | float? }
        required(:start_date_time).maybe(:str?)
        required(:end_date_time).maybe(:str?)
      end
    end
  end
end
