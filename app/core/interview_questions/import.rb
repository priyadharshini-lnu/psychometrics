# frozen_string_literal: true

module InterviewQuestions
  class Import < BaseCommand
    REQUIRED_FIELDS = %w[ID Mandatory MinWords MaxWords].freeze

    attr_accessor :file, :project_id

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(file, headers: true)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def process_csv_data(csv_data)
      csv_data.each do |row|
        process_row(row.to_h)
      end
    end

    def process_row(row_data)
      interview_question = find_or_create_interview_question(row_data)
      interview_question.save!
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError,
            I18n.t('administration.interview_questions.import.errors.save_failed', message: e.message)
    end

    def find_or_create_interview_question(row_data)
      id = row_data['ID']

      interview_question = InterviewQuestion.find_or_initialize_by(id: id, project_id: project_id)
      interview_question.assign_attributes(project_id: project_id)
      interview_question.mandatory = row_data['Mandatory'] == 'yes'
      interview_question.time_limit = row_data['TimeLimit']
      interview_question.question_type = row_data['QuestionType']
      interview_question.question = row_data['Question']
      interview_question.description = row_data['Description']

      interview_question
    end
  end
end
