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
      condition_set_id = users_result.resolve_occupation_condition_set&.id
      return [] if condition_set_id.nil?

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
          avg_scoring = AverageScoring.call!(users_result.scoring, occupations_factor.factor)

          # Collects factor ID if condition is valid
          valid_factors << occupations_factor if condition_valid?(occupations_factor, avg_scoring)
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

    # Checks if condition is valid
    #
    def condition_valid?(occupations_factor, avg_scoring)
      return false if avg_scoring.nil?

      # Pridcate can be ==, !=, >, >=, <, <=
      predicate = OccupationsFactor::CONDITION_MAP[occupations_factor.predicate.to_sym]
      # Checks if avg scoring is valid
      avg_scoring.send(predicate, occupations_factor.value)
    end
  end
end
