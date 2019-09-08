# frozen_string_literal: true

module Assigns
  class CalculateOccupations < BaseCommand
    def initialize(assign)
      @assign = assign
    end

    def call
      broadcast :ok, calculate_occupations
    end

    private

    attr_reader :assign

    def calculate_occupations
      assign.assessment&.
             dimension&.
             occupations&.
             includes(occupations_factors: :factor)&.
             each_with_object([]) do |occupation, mem|
        # Fetchs a valid factor ids
        valid_factors = []
        occupation.occupations_factors.each do |occupations_factor|
          # Calculates AVG of scoring
          avg_scoring = AverageScoring.call!(assign.scoring, occupations_factor.factor)
          # Collects factor ID if condition is valid
          valid_factors << occupations_factor if condition_valid?(occupations_factor, avg_scoring)
        end
        # Calculates ratio of valid factors
        valid_factors_weight_sum = valid_factors.map { |f| f[:weight] }.reduce(&:+) || 0
        total_factors_weight_sum = occupation.occupations_factors.map { |f| f[:weight] }.reduce(&:+)
        value = valid_factors_weight_sum ? (valid_factors_weight_sum / total_factors_weight_sum).round(2) : 0

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
