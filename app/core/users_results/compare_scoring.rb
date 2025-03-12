# frozen_string_literal: true

module UsersResults
  class CompareScoring < BaseCommand
    private_attr_reader :users_result, :saved_scoring

    def initialize(users_result)
      @users_result = users_result
      @saved_scoring = users_result.scoring
    end

    def call
      new_scoring = if users_result.assessment.agile?
                      UsersResults::CalculateAgileScoring.call!(users_result)
                    else
                      UsersResults::CalculateScoring.call!(users_result)
                    end

      factor_score_with_difference = {}
      saved_scoring&.each do |factor_id, scores|
        next if score_equal?(new_scoring[factor_id], scores)

        factor_score_with_difference[factor_id] = {
          saved_scoring: scores,
          new_scoring: new_scoring[factor_id]
        }
      end

      broadcast :ok, factor_score_with_difference.presence
    end

    private

    def score_equal?(score, other_score)
      score_type = %w[score percentage zscore norm_score]
      score.slice(*score_type).compact == other_score.slice(*score_type).compact
    end
  end
end
