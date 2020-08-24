# frozen_string_literal: true

module Reports
  module ResultTypes
    class Survey < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        question = Question.find_by!(id: data['questionId'], assessment_id: data['assessmentId'])
        parser = "Exports::Assessments::Questions::#{question.type}".constantize
        header = parser.headers(question)[:question_id_header]

        # Question types which return multiple headers/values not supported at this time
        return decorate(question) if user_result&.answers.blank? || header.length != 1

        answers = user_result.answers[question.id.to_s].try(:[], 'answers')
        answer = parser.result_label(answers, question)

        decorate(question, answer.first)
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.warn e.message
        decorate(question)
      end

      def decorate(question, answer = nil)
        {
          key: data['questionId'],
          name: data['label'] || question&.name,
          config_data: data,
          value: answer
        }
      end
    end
  end
end
