# frozen_string_literal: true

module EndUser
  class IdpTemplateSkillSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:skill_type).filled(:str?)
        required(:desired_rating).filled { float? | int? }
        required(:min_rating).filled { float? | int? }
        required(:max_rating).filled { float? | int? }
        required(:score).maybe { float? | int? }
      end
    end
  end
end
