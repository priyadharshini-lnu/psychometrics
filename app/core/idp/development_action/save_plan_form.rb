# frozen_string_literal: true

module Idp::DevelopmentAction
  class SavePlanForm < Rectify::Form
    VALID_LEARNING_STYLES = %w[on_the_job structured_learning learning_from_others].freeze

    attribute :user_idp_skill_id, Integer
    attribute :custom_action, String
    attribute :custom_action_learning_style, String
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
    validate :validate_learning_style_for_custom_action
    validate :start_date_not_in_past
    validate :end_date_not_in_past

    def skill_not_exist_in_user_idp_plan
      return if user_idp_plan.user_idp_skills.exists?(id: user_idp_skill_id)

      errors.add(:user_idp_skill_id, :skill_not_exist_in_user_idp_plan)
    end

    private

    def validate_learning_style_for_custom_action
      return if custom_action.blank?

      if custom_action_learning_style.blank?
        errors.add(
          :custom_action_learning_style,
          I18n.t('administration.development_actions.learning_styles.cannot_be_blank')
        )
      elsif VALID_LEARNING_STYLES.exclude?(custom_action_learning_style)
        errors.add(
          :custom_action_learning_style,
          I18n.t('administration.development_actions.learning_styles.invalid')
        )
      end
    end

    def start_date_not_in_past
      return if start_date_time.blank?
      return unless start_date_time.match?(DATE_TIME_FORMAT)

      parsed_date = DateTime.strptime(start_date_time, '%Y-%m-%d %H:%M')
      if parsed_date < DateTime.current
        errors.add(:start_date_time, I18n.t('administration.validations.idp.start_date_cannot_be_in_past'))
      end
    end

    def end_date_not_in_past
      return if end_date_time.blank?
      return unless end_date_time.match?(DATE_TIME_FORMAT)

      parsed_date = DateTime.strptime(end_date_time, '%Y-%m-%d %H:%M')
      if parsed_date < DateTime.current
        errors.add(:end_date_time, I18n.t('administration.validations.idp.end_date_cannot_be_in_past'))
      end
    end

    def user_idp_plan
      context
    end
  end
end
