# frozen_string_literal: true

module UsersResults
  module ExpandAnswersByRecodingTypes
    class MatrixTable < BaseType
      def call
        result =
          answers.map do |answer|
            recode_value = question_recoding.props.find do |p|
              p['scale'] == answer['scale'] && p['choice'] == answer['choice']
            end || {}
            answer.merge('recode_value' => recode_value['value'])
          end
        broadcast :ok, result
      end
    end
  end
end
