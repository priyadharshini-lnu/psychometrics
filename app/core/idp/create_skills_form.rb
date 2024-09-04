# frozen_string_literal: true

module Idp
  class CreateSkillsForm < Rectify::Form
    attribute :skills, Array

    validate :skills_are_valid

    def skills_are_valid
      skills.each do |skill|
        errors.add(:skill_id, I18n.t('validations.blank')) if skill['skill_id'].blank?
      end
    end
  end
end
