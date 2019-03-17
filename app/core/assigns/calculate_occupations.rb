module Assigns
  class CalculateOccupations < BaseCommand
    def initialize(assign)
      @assign = assign
      @occupations_scope = assign.assessment.dimension.occupations.includes(occupations_factors: :factor)
    end

    def call
      broadcast :ok, calculate_occupations
    end

    private

    attr_reader :assign, :occupations_scope

    def calculate_occupations
      occupations_scope.each_with_object([]) do |occupation, mem|
        # Fetchs a valid factor ids
        valid_factor_ids = []
        occupation.occupations_factors.each do |occupations_factor|
          # Calculates AVG of scoring
          avg_scoring = AverageScoring.call!(assign.scoring, occupations_factor.factor)
          # Collects factor ID if condition is valid
          valid_factor_ids << occupations_factor.factor_id if condition_valid?(occupations_factor, avg_scoring)
        end
        # Calculates ratio of valid factors
        value = (valid_factor_ids.size / occupation.occupations_factors.size.to_f).round(2)

        mem << {
          id: occupation.id,
          value: value,
          factor_ids: valid_factor_ids
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
