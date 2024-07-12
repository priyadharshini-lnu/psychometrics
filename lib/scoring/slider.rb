# frozen_string_literal: true

module Scoring
  class Slider
    def calculate(question, result, scoring_template)
      min_value = question.props['minValue'].to_i
      max_value = question.props['maxValue'].to_i
      values = []
      result['answers'].each do |answer|
        next unless answer['value']
        next if result.dig('not_applicable', answer['index'].to_s)

        object = scoring_template.find { |template| template['index'] == answer['index'] }
        next unless object

        values << Utility::Number.scale(answer['value'].to_f, min_value, max_value, object['min'], object['max'])
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      {
        value: value,
        options: [],
        max_value: calculate_max_score(question, scoring_template, result),
        value_sum: value
      }
    end

    def calculate_max_score(question, scoring_template, _result)
      scoring_template.filter_map do |template|
        next if question.props['choices'] <= template['index'].to_i

        template['max']
      end.max
    end
  end
end
