# frozen_string_literal: true

class DevelopmentPlanSummarySchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:skills_by_category_count).hash do
        Skill.categories.each_key do |category|
          optional(category.to_sym).value(:int?)
        end
      end

      required(:development_actions_by_learning_style_count).hash do
        DevelopmentAction.learning_styles.each_key do |style|
          required(style.to_sym).value(:int?)
        end
      end

      required(:skill_progress_by_category).hash do
        Skill.categories.each_key do |category|
          optional(category.to_sym).value(:float?)
        end
      end
    end
  end
end
