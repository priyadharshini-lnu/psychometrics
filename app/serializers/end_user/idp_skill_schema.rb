# frozen_string_literal: true

module EndUser
  class IdpSkillSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:skill_type).filled(:str?)
        required(:skill_category).filled(:str?)
      end
    end
  end
end
