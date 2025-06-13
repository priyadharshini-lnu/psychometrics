# frozen_string_literal: true

class UserIdpSkillSchema < BaseSchema
  def self.schema(_, _) # rubocop:disable Lint/UnderscorePrefixedVariableName
    Dry::Schema.JSON do
      config.validate_keys = true
      required(:name).filled(:str?)
      required(:description).filled(:str?)
      required(:initial_rating).filled(:int?)
      required(:final_rating).filled(:int?)
      required(:skill_type).filled(:str?)
      required(:user_idp_development_actions).hash(UserIdpDevelopmentActionSchema.schema(_, _))
    end
  end
end
