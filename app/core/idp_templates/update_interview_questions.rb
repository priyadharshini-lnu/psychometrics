# frozen_string_literal: true

module IdpTemplates
  class UpdateInterviewQuestions < BaseCommand
    attr_accessor :idp_template, :interview_questions_params

    def initialize(idp_template, interview_questions_params)
      @idp_template = idp_template
      @interview_questions_params = interview_questions_params
    end

    def call
      IdpTemplate.transaction do
        ids = interview_questions_params.map { |interview_question| interview_question[:id] }

        idp_template.idp_template_interview_questions.where.not(interview_question_id: ids).destroy_all
        interview_questions_params.each.with_index do |iq, index|
          itiq = idp_template.idp_template_interview_questions.find_or_create_by!(interview_question_id: iq[:id])
          itiq.update(mandatory: iq[:mandatory], time_limit: iq[:time_limit], order: index)
        end
        broadcast :ok
      end
    end
  end
end
