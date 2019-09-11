# frozen_string_literal: true

module Scoring
  class PickGroupRank
    def calculate(question, result, scoring_template)
      scale_points = question.props['scalePoints']
      response     = (1..scale_points).map { |_i| [] }
      result['answers'].each do |res|
        next unless res['scale'] >= 0 && response[res['scale']]

        scoring = scoring_template.find { |obj| obj['index'] == res['choice'] }
        response[res['scale']] << scoring['value'] if scoring
      end
      values =
        response.map do |r|
          if !r.empty?
            r.sum.to_f / r.size
          else
            0
          end
        end
      { value: values, options: [] }
    end
  end
end
