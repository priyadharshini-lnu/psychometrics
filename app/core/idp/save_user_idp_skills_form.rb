# frozen_string_literal: true

module Idp
  class SaveUserIdpSkillsForm < Rectify::Form
    attribute :skills, Array
    attribute :skill_type, String

    validate :skills_are_valid
    validate :valid_skill_type

    def skills_are_valid
      skills.each do |skill|
        errors.add(:skill_id, I18n.t('validations.blank')) if skill['skill_id'].blank?
      end
    end

    def valid_skill_type
      return if skill_type.blank? # Means that skills are being added for all skill_type

      errors.add(:skill_type, I18n.t('validations.invalid')) unless skill_type.in?(Skill.skill_types.keys)
    end
  end
end
