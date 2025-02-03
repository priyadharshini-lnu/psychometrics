# frozen_string_literal: true

module EndUser
  class UserIdpSkillSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:skill_id).filled(:int?)
        required(:name).filled(:str?)
        required(:initial_rating).maybe { int? | float? }
        required(:final_rating).maybe { int? | float? }
      end
    end
  end
end
