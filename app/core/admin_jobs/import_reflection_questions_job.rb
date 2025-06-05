# frozen_string_literal: true

module AdminJobs
  class ImportReflectionQuestionsJob < BaseExportCsv
    def call
      project_id = record.data['project_id']

      result = ReflectionQuestions::Import.new(
        record.file,
        project_id
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end
  end
end
