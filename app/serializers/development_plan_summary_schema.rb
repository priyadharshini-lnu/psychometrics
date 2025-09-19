# frozen_string_literal: true

class DevelopmentPlanSummarySchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:skills_by_skill_type_count).hash do
        ::Skill.skill_types.each_key do |skill_type|
          optional(skill_type.to_sym).value(:int?)
        end
      end

      required(:development_actions_by_learning_style_count).hash do
        DevelopmentAction.learning_styles.each_key do |style|
          required(style.to_sym).value(:int?)
        end
      end

      required(:skill_progress_by_skill_type).hash do
        ::Skill.skill_types.each_key do |skill_type|
          optional(skill_type.to_sym).value(:float?)
        end
      end
    end
  end
end
