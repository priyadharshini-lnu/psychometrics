# frozen_string_literal: true

module Scoring
  class MatrixTable
    def calculate(question, result, scoring_template)
      values = []
      options = []
      result['answers'].each do |answer|
        next unless answer['value'] && not_applicable?(result, answer['choice']) != true

        object = scoring_template.detect do |template|
          template['scale'] == answer['scale'] && template['choice'] == answer['choice']
        end
        if object
          values << object['value'].to_f if object['value']
          options << { choice: answer['choice'], value: object['value'] }
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      {
        value: value,
        value_sum: values.empty? ? nil : values.sum,
        options: options,
        max_value: calculate_max_score(question, scoring_template, result)
      }
    end

    def calculate_max_score(question, scoring_template, result) # rubocop:disable Metrics/PerceivedComplexity
      scoring_template_by_choice = scoring_template.group_by { |template| template['choice'] }
      answered_choices = result['answers'].pluck('choice').uniq

      max_values = scoring_template_by_choice.map do |choice, templates|
        next if question.props['choices'] <= choice.to_i
        next if not_applicable?(result, choice)
        next unless answered_choices.include?(choice)

        choice_values = templates.filter_map do |template|
          next if question.props['scalePoints'] <= template['scale'].to_i

          template['value'].to_f
        end
        if question.props['answersType'] == 'MultipleAnswer'
          choice_values.sum
        else
          choice_values.max
        end
      end
      return nil if max_values.compact.empty?

      max_values.compact.sum
    end

    def not_applicable?(result, choice)
      not_applicable = result['not_applicable']
      return false if not_applicable.nil?
      return false unless not_applicable.is_a?(Hash)

      not_applicable[choice.to_s] == true
    end
  end
end
