# frozen_string_literal: true

module UsersResults
  module ExpandAnswersByRecodingTypes
    class SideBySide < BaseType
      def call
        result = answers.map { |answer| answer.merge('values' => expand_values(answer)) }
        broadcast :ok, result
      end

      def expand_values(answer)
        question_recoding_row = question_recoding.props.find do |p|
          p['scale'] == answer['scale'] && p['choice'] == answer['choice']
        end
        return answer['values'] unless question_recoding_row

        answer['values'].map do |value|
          recode_value = question_recoding_row['values'].find { |p| p['index'] == value['index'] } || {}
          value.merge('recode_value' => recode_value['value'])
        end
      end
    end
  end
end
