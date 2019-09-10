# frozen_string_literal: true

module Scoring
  class MatrixTable
    def calculate(_question, result, scoring_template)
      values = []
      options = []

      result['answers'].each do |answer|
        next unless answer['value'] && (result.dig('not_applicable', answer['choice'].to_s) != true)

        object = scoring_template.detect do |template|
          template['scale'] == answer['scale'] && template['choice'] == answer['choice']
        end
        if object
          values << object['value']
          options << { choice: answer['choice'], value: object['value'] }
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: options }
    end
  end
end
