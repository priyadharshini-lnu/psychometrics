module Scoring
  class PickGroupRank
    def calculate(question, result, scoring_template)
      scale_points = question.props['scalePoints']
      response = Array.new(scale_points, 0)
      result['answers'].each do |res|
        if res['scale'] >= 0 && response[res['scale']]
          scoring = scoring_template.find { |obj| obj['index'] == res['choice'] }
          if scoring
            response[res['scale']] = response[res['scale']] + scoring['value']
          end
        end
      end
      response
    end
  end
end
