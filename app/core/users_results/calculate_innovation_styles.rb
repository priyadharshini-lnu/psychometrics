# frozen_string_literal: true

module UsersResults
  class CalculateInnovationStyles < BaseCommand
    def initialize(users_result)
      @users_result = users_result
    end

    def call
      broadcast :ok, calculate_innovation_styles
    end

    private

    attr_reader :users_result

    def calculate_innovation_styles # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      users_result.assessment&.
             dimension&.
             innovation_styles&.
             includes(innovation_styles_factors: :factor)&.
             each_with_object([]) do |innovation_style, mem|
        # Fetchs a valid factor ids
        valid_factors = []
        next if innovation_style.innovation_styles_factors.empty?

        innovation_style.innovation_styles_factors.each do |innovation_styles_factor|
          # Calculates AVG of scoring
          avg_scoring = AverageScoring.call!(users_result.scoring, innovation_styles_factor.factor)
          # Collects factor ID if condition is valid
          valid_factors << innovation_styles_factor if condition_valid?(innovation_styles_factor, avg_scoring)
        end
        # Calculates ratio of valid factors
        valid_factors_weight_sum = valid_factors.sum { |f| f[:weight] } || 0
        total_factors_weight_sum = innovation_style.innovation_styles_factors.sum { |f| f[:weight] }
        value = total_factors_weight_sum ? (valid_factors_weight_sum / total_factors_weight_sum).round(2) * 100 : 0

        mem << {
          id: innovation_style.id,
          value: value,
          factor_ids: valid_factors.map(&:factor_id)
        }
      end
    end

    # Checks if condition is valid
    #
    def condition_valid?(innovation_styles_factor, avg_scoring)
      return false if avg_scoring.nil?

      # Pridcate can be ==, !=, >, >=, <, <=
      predicate = InnovationStylesFactor::CONDITION_MAP[innovation_styles_factor.predicate.to_sym]
      # Checks if avg scoring is valid
      avg_scoring.send(predicate, innovation_styles_factor.value)
    end
  end
end
