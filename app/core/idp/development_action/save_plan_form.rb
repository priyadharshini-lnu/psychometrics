# frozen_string_literal: true

module Idp::DevelopmentAction
  class SavePlanForm < Rectify::Form
    attribute :user_idp_skill_id, Integer
    attribute :custom_action, String
    attribute :start_date_time, String
    attribute :end_date_time, String
    attribute :private, Boolean
    attribute :progress, Integer

    DATE_TIME_FORMAT = /\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\z/

    validates :start_date_time, format: { with: DATE_TIME_FORMAT }, allow_blank: true
    validates :end_date_time, format: { with: DATE_TIME_FORMAT }, allow_blank: true
    validates :progress, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 },
    allow_blank: true
    validates :private, inclusion: [true, false], allow_blank: true
    validates :user_idp_skill_id, presence: true
    validate :skill_not_exist_in_user_idp_plan

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
