# frozen_string_literal: true

module UsersResults
  class ExpandAnswersByRecoding < BaseCommand
    def initialize(users_result)
      @users_result = users_result
      @question_recoding_map = QuestionRecoding.
                               where(assessment_id: users_result.assessment_id).
                               includes(:question).
                               index_by(&:question_id)
    end

    def call
      result =
        users_result.answers.transform_values do |answer|
          question_recoding = question_recoding_map[answer['question_id']]
          if question_recoding
            {
              'answers' => lookup_type_class(question_recoding)&.call!(answer['answers'], question_recoding) || answer['answers'],
              'question_id' => answer['question_id']
            }
          else
            answer
          end
        end
      broadcast(:ok, result)
    end

    def lookup_type_class(question_recoding)
      class_name = "UsersResults::ExpandAnswersByRecodingTypes::#{question_recoding.question.type}"
      class_name.safe_constantize
    end

    private

    attr_reader :users_result, :question_recoding_map
  end
end
