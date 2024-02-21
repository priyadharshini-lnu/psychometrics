# frozen_string_literal: true

module Scoring
  class Slider
    def calculate(question, result, scoring_template)
      min_value = question.props['minValue'].to_i
      max_value = question.props['maxValue'].to_i
      choices = question.props['choices'].to_i
      scoring = 0
      result['answers'].each do |answer|
        next unless answer['value']

        object = scoring_template.find { |template| template['index'] == answer['index'] }
        next unless object

        scoring += Utility::Number.scale(answer['value'].to_f, min_value, max_value, object['min'], object['max'])
      end
      {
        value: scoring / choices,
        options: [],
        max_value: calculate_max_score(question, scoring_template, result),
        value_sum: scoring
      }
    end

    def calculate_max_score(question, scoring_template, _result)
      total = scoring_template.sum { |template| [template['min'], template['max']].max }
      total / question.props['choices'].to_i
    end
  end
end
