# frozen_string_literal: true

module ScoreApprovals
  class DiscardQuestion < BaseCommand
    private_attr_reader :current_user, :score_approval, :question_id

    def initialize(score_approval, question_id, current_user)
      @score_approval = score_approval
      @question_id = question_id
      @current_user = current_user
    end

    def call
      unless allow_to_discard?
        return broadcast :error, I18n.t('admin.score_approval_not_allowed_to_discard')
      end

      updated_scores = nil
      error_message = nil

      ActiveRecord::Base.transaction do
        discard_question_scores

        ::AI::ContentAnalysis::UpdateDependentFactorScores.new(question_scores).
          on(:ok) { |dependent_scores| updated_scores = [*dependent_scores, *question_scores].compact.uniq }.
          on(:error) do |error|
            error_message = error
            raise ActiveRecord::Rollback
          end.call
      end

      return broadcast(:error, error_message) if error_message

      broadcast :ok, updated_scores
    end

    private

    def discard_question_scores
      question_scores.each do |factor_score|
        factor_score.change_log_data = {
          change_event: 'discard_question',
          user_id: current_user.id,
          user_name: current_user.name
        }

        factor_score.update!(
          not_applicable: false,
          override_score: nil
        )
      end
    end

    def question_scores
      @question_scores ||= users_result.ai_factor_scores.where(question_id: question_id)
    end

    def allow_to_discard?
      policy.discard_question?
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
  end
end
