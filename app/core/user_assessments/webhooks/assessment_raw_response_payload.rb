# frozen_string_literal: true

module UserAssessments
  module Webhooks
    class AssessmentRawResponsePayload
      private_attr_reader :user_assessment, :user_result

      def self.call(user_assessment)
        new(user_assessment).call
      end

      def initialize(user_assessment)
        @user_assessment = user_assessment
        @user_result = user_assessment.users_result
      end

      def call
        {
          campaign: user_assessment.campaign,
          assessment: user_assessment.assessment,
          subject: user_assessment.subject,
          event_time: user_assessment.completed_at,
          answers: formatted_answers
        }
      end

      private

      def formatted_answers
        assessment = user_result.user_assessment.assessment
        questions = assessment.questions.not_deleted.joins(:block).order('blocks.position ASC, position ASC')

        answers_payload = []
        questions.each do |question|
          answer_data = build_question_answer(question)
          answers_payload << answer_data if answer_data
        end
        answers_payload
      end

      def build_question_answer(question)
        question_id_str = question.id.to_s
        answer_data = user_result.answers[question_id_str]

        return nil if answer_data.blank?

        return nil unless Question::QUESTIONS_WITH_EXPORTABLE_ANSWERS.include?(question.type)

        parser = "Exports::Assessments::Questions::#{question.type}".constantize

        {
          question_id: question.id,
          question_type: question.type,
          question_name: question.name,
          question_text: question.props['questionText'],
          not_applicable: parser.get_not_applicable(user_result, question),
          answers: build_answers_with_labels(parser, question)
        }
      end

      def build_answers_with_labels(parser, question)
        return [] if user_result.answers[question.id.to_s].blank?

        answers = parser.result(user_result, question, scoring: false, export_with_labels: true, concat_answers: false)
        answers.pop # remove duration

        if question.type == 'CampaignFactorFeedback'
          answers.each_slice(2).filter_map do |(factor_name, value)|
            if factor_name.present?
              {
                campaign_factor_name: factor_name,
                value: value == '' ? nil : value
              }
            end
          end
        else
          headers = parser.headers(question)
          answers.each_with_index.map do |answer, index|
            label = headers.dig(:question_choice_header, index)
            build_answer_object(label, answer)
          end
        end
      end

      def build_answer_object(label, answer)
        value = answer == '' ? nil : answer
        return { value: value } if label.blank?

        { label: label, value: value }
      end
    end
  end
end
