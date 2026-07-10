# frozen_string_literal: true

module UsersResults
  class CalculateOccupations < BaseCommand
    def initialize(users_result)
      @users_result = users_result
    end

    def call
      broadcast :ok, calculate_occupations
    end

    private

    attr_reader :users_result

    def calculate_occupations # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      condition_set = users_result.resolve_occupation_condition_set
      condition_set_id = condition_set&.id
      return [] if condition_set_id.nil?

      score_key = condition_set.score_type == 'normed' ? 'norm_score' : 'score'

      users_result.assessment&.
        dimension&.
        occupations&.
        includes(occupations_factors: :factor)&.
        where(occupations_factors: { occupation_condition_set_id: condition_set_id })&.
        distinct&.
        each_with_object([]) do |occupation, mem|
        occupations_factors = occupation.occupations_factors

        # Fetch a valid factor ids
        valid_factors = []
        next if occupations_factors.empty?

        occupations_factors.each do |occupations_factor|
          factor_score = users_result.scoring&.dig(occupations_factor.factor_id.to_s, score_key)
          valid_factors << occupations_factor if condition_valid?(occupations_factor, factor_score)
        end
        # Calculates ratio of valid factors
        valid_factors_weight_sum = valid_factors.sum(&:weight)
        total_factors_weight_sum = occupations_factors.sum(&:weight)
        value = if total_factors_weight_sum.positive?
                  (valid_factors_weight_sum / total_factors_weight_sum).round(2)
                else
                  0
                end

        mem << {
          id: occupation.id,
          value: value,
          factor_ids: valid_factors.map(&:factor_id)
        }
      end
    end

    def condition_valid?(occupations_factor, factor_score)
      return false if factor_score.nil?

      predicate = OccupationsFactor::CONDITION_MAP[occupations_factor.predicate.to_sym]
      factor_score.send(predicate, occupations_factor.value)
    end
  end
end
