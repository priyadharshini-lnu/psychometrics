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
          question_recoding = question_recoding_map[answer['question_id']] ||
                              lookup_default_recoding(answer['question_id'])
          if question_recoding
            {
              'answers' => lookup_type_class(question_recoding)&.
                call!(answer['answers'], question_recoding) || answer['answers'],
              'question_id' => answer['question_id'],
              'not_applicable' => answer['not_applicable']
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

    def lookup_default_values_class(question)
      return nil unless question

      class_name = "UsersResults::DefaultRecodingValues::#{question.type}"
      class_name.safe_constantize
    end

    def lookup_default_recoding(question_id)
      question = question_map[question_id]
      props = lookup_default_values_class(question)&.call!(question)
      return nil unless props

      QuestionRecoding.new(question_id: question_id, props: props)
    end

    def question_map
      @question_map ||= Question.where(assessment_id: users_result.assessment_id).index_by(&:id)
    end

    private

    attr_reader :users_result, :question_recoding_map
  end
end
