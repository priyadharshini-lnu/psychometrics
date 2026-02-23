# frozen_string_literal: true

module ScoreApprovals
  class OverrideScore < BaseCommand
    attr_reader :current_user, :factor_score, :score, :reason, :not_applicable

    def initialize(factor_score, params, current_user)
      @factor_score = factor_score
      @score = params[:score]
      @not_applicable = params[:not_applicable] || false
      @reason = params[:reason]
      @current_user = current_user
    end

    def call
      is_no_change = factor_score.not_applicable == not_applicable
      is_no_change &&= not_applicable || (factor_score.final_score == score)

      if is_no_change
        return broadcast(:ok, [factor_score])
      end

      score_min = factor_score.factor.score_min || 1
      score_max = factor_score.factor.score_max || 5

      if !not_applicable && (score < score_min || score > score_max)
        return broadcast(:error, I18n.t('admin.score_must_be_in_between_min_and_max', min: score_min, max: score_max))
      end

      factor_score.change_log_data = {
        change_event: 'override_score',
        reason: reason,
        user_id: current_user.id,
        user_name: current_user.name
      }

      updated_scores = nil
      error_message = nil

      ActiveRecord::Base.transaction do
        factor_score.update!(not_applicable: not_applicable, override_score: score)

        ::AI::ContentAnalysis::UpdateDependentFactorScores.new(factor_score).
          on(:ok) { |dependent_scores| updated_scores = [*dependent_scores, factor_score] }.
          on(:error) do |error|
          error_message = error
          raise ActiveRecord::Rollback
        end.
          call
      end

      return broadcast(:error, error_message) if error_message

      broadcast(:ok, updated_scores)
    end
  end
end
