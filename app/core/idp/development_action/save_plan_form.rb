# frozen_string_literal: true

module Idp::DevelopmentAction
  class SavePlanForm < Rectify::Form
    attribute :user_idp_skill_id, Integer
    attribute :user_idp_development_actions_attributes, Array

    validates :user_idp_skill_id, presence: true
    validates :user_idp_development_actions_attributes, presence: true

    validate :validate_development_actions
    validate :skill_not_exist_in_user_idp_plan

    def validate_development_actions
      user_idp_development_actions_attributes.each do |action_params|
        form = Idp::DevelopmentAction::UserIdpDevelopmentActionForm.new(action_params)
        next unless form.invalid?

        form.errors.each do |error|
          errors.add(:user_idp_development_action, "#{error.attribute}: #{error.message}")
        end
      end
    end

    def skill_not_exist_in_user_idp_plan
      return if user_idp_plan.user_idp_skills.exists?(id: user_idp_skill_id)

      errors.add(:user_idp_skill_id, :skill_not_exist_in_user_idp_plan)
    end

    private

    def user_idp_plan
      context
    end
  end
end
