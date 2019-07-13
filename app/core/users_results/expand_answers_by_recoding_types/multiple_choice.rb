module UsersResults
  module ExpandAnswersByRecodingTypes
    class MultipleChoice < BaseType
      def call
        result =
          answers.map do |answer|
            recode_value = question_recoding.props.find do |p|
              p['index'] == answer['index']
            end || {}
            answer.merge('recode_value' => recode_value['value'])
          end
        broadcast :ok, result
      end
    end
  end
end
