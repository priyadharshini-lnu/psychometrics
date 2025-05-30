# frozen_string_literal: true

module EndUser
  class SkillSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:name).filled(:string)
        required(:skill_type).filled(:string)
      end
    end
  end
end
