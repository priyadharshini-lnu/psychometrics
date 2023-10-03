# frozen_string_literal: true

module Scoring
  class MultipleChoice
    def calculate(question, result, scoring_template)
      values = []

      result['answers']&.each do |answer|
        if answer['value'] && result['not_applicable'] != true
          object = scoring_template.find { |template| template['index'] == answer['index'] }
          values << object['value'].to_f if object && object['value']
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      {
        value: value,
        value_sum: values.empty? ? nil : values.sum,
        options: [],
        max_value: calculate_max_score(question, scoring_template, result)
      }
    end

    def calculate_max_score(question, scoring_template, result)
      max_values = scoring_template.filter_map do |template|
        next if question.props['choices'] <= template['index'].to_i
        next if result['not_applicable'] == true

        template['value'].to_f
      end
      if question.props['type'] == 'MultipleAnswer'
        max_values.sum
      else
        max_values.max
      end
    end
  end
end
