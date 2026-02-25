# frozen_string_literal: true

module ScoreApprovals
  class ApproveQuestion < BaseCommand
    private_attr_reader :current_user, :score_approval, :question_id

    def initialize(score_approval, question_id, current_user)
      @score_approval = score_approval
      @question_id = question_id
      @current_user = current_user
    end

    def call
      unless allow_to_approve?
        return broadcast :error, I18n.t('admin.score_approval_not_allowed_to_approve')
      end

      update_question_scores_status
      assessor_approve_user_assessment if all_question_scores_approved_by_assessor?
      approve_user_assessment if all_question_scores_approved_by_approver?

      broadcast :ok, question_scores
    end

    private

    def update_question_scores_status
      question_scores.update_all(status: approval_status)
    end

    def approval_status
      return superadmin_status if current_user.is?(:superadmin)
      return :approver_approved if approval_settings.one_level_approve? && approver?

      approver? ? :approver_approved : :assessor_approved
    end

    def question_scores
      @question_scores ||= users_result.ai_factor_scores.where(question_id: question_id)
    end

    def allow_to_approve?
      return false if score_approval.approver_approved?

      policy.approve_question?
    end

    def all_question_scores_approved_by_assessor?
      return false if approval_settings.one_level_approve?

      score_approval.pending? && users_result.ai_factor_scores.
        where.not(scoring_type: :aggregated).
        where.not(status: :assessor_approved).
        none?
    end

    def all_question_scores_approved_by_approver?
      users_result.ai_factor_scores.
        where.not(scoring_type: :aggregated).
        where.not(status: :approver_approved).
        none?
    end

    def assessor_approve_user_assessment
      score_approval.approve!
      score_approval.update(score_assessed_by_id: current_user.id, score_assessed_at: Time.current)
    end

    def approve_user_assessment
      score_approval.approver_approve!
      score_approval.update(score_approved_by_id: current_user.id, score_approved_at: Time.current)
    end

    def users_result
      @users_result ||= score_approval.users_result
    end

    def approval_settings
      @approval_settings ||= AI::ScoringApprovalSetting.find_by(
        campaign_id: user_assessment.campaign_id,
        assessment_id: user_assessment.assessment_id
      )
    end

    def policy
      @policy ||= Api::Administration::AI::ScoreApprovalPolicy.new(current_user, score_approval)
    end

    def user_assessment
      @user_assessment ||= score_approval.as_user_assessment
    end

    def assessor?
      approval_settings.assessor_ids.include?(current_user.id)
    end

    def approver?
      approval_settings.approver_ids.include?(current_user.id)
    end

    def superadmin_status
      if approval_settings.one_level_approve? || score_approval.assessor_approved?
        :approver_approved
      else
        :assessor_approved
      end
    end
  end
end
