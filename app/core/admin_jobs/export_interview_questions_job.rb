# frozen_string_literal: true

module AdminJobs
  class ExportInterviewQuestionsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.interview_questions.export.details'), file_link]]
    end

    def headers
      %w[
        ID
        Mandatory
        TimeLimit
        QuestionType
        Question
        Description
      ]
    end

    def records_for_export
      InterviewQuestion.where(project_id: record.data['project_id'])
    end

    def data_row(interview_question)
      [
        interview_question.id,
        interview_question.mandatory ? 'yes' : 'no',
        interview_question.time_limit,
        interview_question.question_type,
        interview_question.question,
        interview_question.description
      ]
    end

    def file_name
      "#{project.name}-interview-questions.csv"
    end
  end
end
