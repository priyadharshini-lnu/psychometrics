# frozen_string_literal: true

module Reports
  module ResultTypes
    class Survey < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        question = context.resources.dig(:questions, data['questionId'])
        raise ActiveRecord::RecordNotFound unless question

        parser = "Exports::Assessments::Questions::#{question.type}".constantize
        header = parser.headers(question)[:question_id_header]
        header_without_duration = header.select { |a| a.exclude?('duration') }

        # Question types which return multiple headers/values not supported at this time
        return decorate(question) if user_result&.answers.blank? || header_without_duration.length != 1

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
