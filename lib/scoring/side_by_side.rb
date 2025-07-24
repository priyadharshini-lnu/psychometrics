# frozen_string_literal: true

module Scoring
  class SideBySide
    def calculate(question, result, question_scoring) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      values = []
      options = []
      scoring_template = question_scoring.props

      result['answers'].each do |answer|
        next if answer['values'].blank?

        object = scoring_template.find do |template|
          template['scale'] == answer['scale'] && template['choice'] == answer['choice']
        end
        next unless object && object['values']

        answer['values'].each do |inner_result|
          inner_object = object['values'].find { |template| template['index'] == inner_result['index'] }
          next unless inner_object

          values << inner_object['value'] if inner_object['value']
          options << { choice: answer['choice'], value: inner_object['value'] }
        end
      end

      value = values.empty? ? nil : values.sum.to_f / values.size
      {
        value: value,
        options: options,
        max_value: calculate_max_score(question, scoring_template, result)
      }
    end

    def calculate_max_score(question, scoring_template, result) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
      scoring_template_by_choice = scoring_template.group_by { |template| template['choice'] }
      answered_choices = result['answers'].pluck('choice').uniq

      max_values = scoring_template_by_choice.map do |choice, templates|
        next if question.props['choices'] <= choice.to_i
        next unless answered_choices.include?(choice)

        choice_values = templates.filter_map do |template|
          next if question.props['scalePoints'] <= template['scale'].to_i
          next unless template['values']

          column_data = question.props['columnsData']&.[](template['scale'])
          has_multiple_answer = column_data&.dig('likertType') == 'MultipleAnswer'

          if has_multiple_answer
            template['values'].filter_map { |v| v['value']&.to_f }.sum
          else
            template['values'].filter_map { |v| v['value']&.to_f }.max
          end
        end

        choice_values.sum
      end
      return nil if max_values.compact.empty?

      max_values.compact.sum
    end
  end
end
