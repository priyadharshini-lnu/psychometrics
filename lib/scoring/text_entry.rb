# frozen_string_literal: true

module Scoring
  class TextEntry
    def calculate(_question, result, question_scoring)
      values = []
      scoring_template = question_scoring.props

      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.find { |template| template['index'] == answer['value'] }
          values << object['value'] if object && object['value']
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: [] }
    end
  end
end
