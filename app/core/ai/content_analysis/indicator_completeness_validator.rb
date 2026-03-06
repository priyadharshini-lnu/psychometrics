# frozen_string_literal: true

module AI
  module ContentAnalysis
    class IndicatorCompletenessValidator
      attr_reader :expected_indicator_ids

      def initialize(expected_indicator_ids)
        @expected_indicator_ids = expected_indicator_ids.map(&:to_i)
      end

      def validate(response)
        return nil if expected_indicator_ids.empty?

        indicator_scores = response['indicator_scores']
        return "Response is missing 'indicator_scores' array" unless indicator_scores.is_a?(Array)

        returned_ids = indicator_scores.filter_map { |s| s['indicator_id']&.to_i }
        missing_ids = expected_indicator_ids - returned_ids

        return nil if missing_ids.empty?

        'You must provide scores for ALL indicators. ' \
          "Missing indicator_ids: #{missing_ids.join(', ')}. " \
          'Please include scores for these indicators in the indicator_scores array.'
      end
    end
  end
end
