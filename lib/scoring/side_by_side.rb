# frozen_string_literal: true

module Scoring
  class SideBySide
    # rubocop:disable Metrics/CyclomaticComplexity Metrics/PerceivedComplexity
    def calculate(_question, result, scoring_template)
      values = []
      options = []
      result['answers'].each do |answer|
        next unless answer['values'] && !answer['values'].empty?

        object = scoring_template.find do |template|
          template['scale'] == answer['scale'] && template['choice'] == answer['choice']
        end
        next unless object && object['values']

        answer['values'].each do |inner_result|
          inner_object = object['values'].find { |template| template['index'] == inner_result['index'] }
          if inner_object
            values << inner_object['value']
            options << { choice: answer['choice'], value: inner_object['value'] }
          end
        end
      end

      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: options }
    end
    # rubocop:enable Metrics/CyclomaticComplexity Metrics/PerceivedComplexity
  end
end
