# frozen_string_literal: true

module Scoring
  class PickGroupRank
    def calculate(question, result, question_scoring) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
      scale_points = question.props['scalePoints']
      response     = (1..scale_points).map { |_i| [] }
      scoring_template = question_scoring.props

      result['answers']&.each do |res|
        next unless res['scale'] >= 0 && response[res['scale']]

        scoring = scoring_template.find { |obj| obj['index'] == res['choice'] }
        response[res['scale']] << scoring['value'] if scoring && scoring['value']
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
