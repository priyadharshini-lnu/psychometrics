# frozen_string_literal: true

module EndUser
  class UserIdpSkillsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:description).filled(:str?)
        required(:skill_type).filled(:str?)
        required(:initial_rating).value { nil? | int? | float? }
        required(:final_rating).value { nil? | int? | float? }
        required(:skill_id).filled(:int?)
      end
    end
  end
end
