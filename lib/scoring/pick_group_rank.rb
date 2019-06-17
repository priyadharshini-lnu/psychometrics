module Scoring
  class PickGroupRank
    def calculate(question, result, scoring_template)
      scale_points = question.props['scalePoints']
      response     = (1..scale_points).map { |i| [] }
      result['answers'].each do |res|
        if res['scale'] >= 0 && response[res['scale']]
          scoring = scoring_template.find { |obj| obj['index'] == res['choice'] }
          if scoring
            response[res['scale']] << scoring['value']
          end
        end
      end
      values =
        response.map do |r|
          if r.length > 0
            r.sum.to_f / r.size
          else
            0
          end
        end
      { value: values, options: [] }
    end
  end
end
