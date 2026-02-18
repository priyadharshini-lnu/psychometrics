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
