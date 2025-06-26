# frozen_string_literal: true

module Idp
  class UpdateStatusForm < Rectify::Form
    attribute :user_idp_plan, UserIdpPlan
    attribute :current_user, User
    attribute :status, String

    validates :status, presence: true
    validate :status_is_permitted_for_current_user
    validate :manager_cannot_update_forbidden_states
    validate :requires_reflective_questions, if: -> { status == 'completed' }

    PERMITTED_STATUSES = {
      manager: %w[approved rejected],
      idp_user: %w[draft pending_approval in_progress completed],
      idp_user_without_manager: %w[draft approved in_progress completed]
    }.freeze

    STATUS_TO_EVENT = {
      draft: 'draft',
      approved: 'approve',
      rejected: 'reject',
      pending_approval: 'submit_for_approval',
      in_progress: 'start',
      completed: 'complete'
    }.freeze

    FORBIDDEN_PLAN_STATES_FOR_MANAGER = %w[completed in_progress draft not_started].freeze

    def save!
      return false unless valid?

      event = STATUS_TO_EVENT[status.to_sym]

      unless event
        errors.add(:status, I18n.t('validations.invalid'))
        return false
      end

      begin
        user_idp_plan.public_send(:"#{event}!")
      rescue Workflow::NoTransitionAllowed => e
        errors.add(:base, e.message)
        false
      end
    end

    private

    def requires_reflective_questions
      unless all_required_reflective_questions_answered?
        errors.add(:base, I18n.t('validations.idp.reflective_questions_required'))
      end
    end

    def all_required_reflective_questions_answered?
      question_ids = user_idp_plan.idp_template_reflection_questions.where(mandatory: true).
                     pluck(:reflection_question_id)
      answers = user_idp_plan.user_reflection_question_answers.where(reflection_question_id: question_ids).
                where.not(answer: nil)

      question_ids.count == answers.count
    end

    def status_is_permitted_for_current_user
      unless allowed_statuses_for_current_user.include?(status)
        errors.add(:status, I18n.t('validations.idp.status_not_permitted'))
      end
    end

    def manager_cannot_update_forbidden_states
      if current_user_is_manager && manager_forbidden_state?
        errors.add(:base, I18n.t('validations.idp.status_not_permitted_by_manager', status: user_idp_plan.status))
      end
    end

    def allowed_statuses_for_current_user
      if current_user_is_manager && manager_approval_required?
        PERMITTED_STATUSES[:manager]
      elsif idp_user == current_user
        manager_approval_required? ? PERMITTED_STATUSES[:idp_user] : PERMITTED_STATUSES[:idp_user_without_manager]
      else
        []
      end
    end

    def current_user_is_manager
      idp_user.manager == current_user
    end

    def idp_user
      @idp_user ||= user_idp_plan.user
    end

    def idp_settings
      @idp_settings ||= user_idp_plan.project.idp_setting
    end

    def manager_approval_required?
      idp_settings.manager_approves_idp
    end

    def manager_forbidden_state?
      FORBIDDEN_PLAN_STATES_FOR_MANAGER.include?(user_idp_plan.status)
    end

    def user_idp_plan
      context[:user_idp_plan]
    end

    def current_user
      context[:current_user]
    end
  end
end
