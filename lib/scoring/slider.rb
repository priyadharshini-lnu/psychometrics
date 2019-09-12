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

        percent = (answer['value'].to_f - min_value) / (max_value - min_value)
        percent = 1 - percent if object['reverse']
        scoring += object['value'] * percent
      end
      { value: scoring / choices, options: [] }
    end
  end
end
