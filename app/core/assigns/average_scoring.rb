module Assigns
  class AverageScoring < BaseCommand
    def initialize(scoring, factor)
      @scoring = scoring.with_indifferent_access
      @factor = factor
    end

    def call
      return broadcast :ok, nil if scoring.blank?

      results = fetch_results(factor.id)
      # If there is no results for Factor
      #   Then collect SubFactors results
      if results.blank? && factor.parent_id.nil?
        results = factor.
                  sub_factor_ids.
                  each_with_object([]) { |id, res| res << fetch_results(id) }.
                  flatten.
                  compact
      end
      # Returns nil if there are no results
      return broadcast :ok, 0.0 if results.blank?

      # Calculates sum of value
      sum_scoring = results.inject(0.0) { |sum, result| sum + result['value'].to_f }
      # Calculates avg of value with 2 numbers after comma
      avg_scoring = (sum_scoring / results.size.to_f).round(2)
      broadcast :ok, avg_scoring
    end

    private

    attr_reader :scoring, :factor

    # Fetchs results based on Factor ID
    #
    def fetch_results(factor_id)
      scoring&.dig(factor_id.to_s, 'results') || []
    end
  end
end
