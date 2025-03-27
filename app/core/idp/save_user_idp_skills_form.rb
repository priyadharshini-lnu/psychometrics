# frozen_string_literal: true

module Idp
  class SaveUserIdpSkillsForm < Rectify::Form
    attribute :skills, Array
    attribute :category, String

    validate :skills_are_valid
    validate :valid_category

    def skills_are_valid
      skills.each do |skill|
        errors.add(:skill_id, I18n.t('validations.blank')) if skill['skill_id'].blank?
      end
    end

    def valid_category
      return if category.blank? # Means that skills are being added for all category

      errors.add(:category, I18n.t('validations.invalid')) unless category.in?(Skill.categories.keys)
    end
  end
end
