# frozen_string_literal: true

module Scoring
  class PickGroupRank
    def calculate(question, result, scoring_template) # rubocop:disable Metrics/PerceivedComplexity
      scale_points = question.props['scalePoints']
      response     = (1..scale_points).map { |_i| [] }
      result['answers']&.each do |res|
        next unless res['scale'] >= 0 && response[res['scale']]

        scoring = scoring_template.find { |obj| obj['index'] == res['choice'] }
        response[res['scale']] << scoring['value'] if scoring
      end
      values =
        response.map do |r|
          if r.empty?
            0
          else
            r.sum.to_f / r.size
          end
        end
      { value: values, options: [] }
    end
  end
end
