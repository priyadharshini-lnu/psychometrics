# frozen_string_literal: true

module Idp
  class UpdateUserIdpSkillForm < Rectify::Form
    attribute :initial_rating, Float

    validate :self_skill_rating_enabled?

    validates :initial_rating, numericality: { greater_than: 0, less_than_or_equal_to: UserIdpSkill::MAX_RATING }

    def self_skill_rating_enabled?
      return if idp_template.self_rating_enabled

      errors.add(:initial_rating, I18n.t('validations.user_self_skill_rating_disabled'))
    end

    private

    def idp_template
      user_idp_skill.user_idp_plan.idp_template
    end

    def user_idp_skill
      context.user_idp_skill
    end
  end
end
