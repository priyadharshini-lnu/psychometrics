# frozen_string_literal: true

class UserIdpPlanSchema < BaseSchema
  def self.schema(_, _) # rubocop:disable Lint/UnderscorePrefixedVariableName
    Dry::Schema.JSON do
      config.validate_keys = true
      required(:name).filled(:str?)
      required(:role).filled(:str?)
      required(:division).filled(:str?)

      required(:user_idp_skills).hash(UserIdpSkillSchema.schema(_, _))
      required(:reflection_questions).array(:hash) do
        required(:id).filled(:int?)
        required(:mandatory).filled(:bool?)
        required(:question).filled(:str?)
        required(:min_words).maybe(:int?)
        required(:max_words).maybe(:int?)
        required(:answer).maybe(:str?)
      end
    end
  end
end
