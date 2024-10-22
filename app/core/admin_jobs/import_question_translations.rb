# frozen_string_literal: true

module AdminJobs
  class ImportQuestionTranslations < AdminJobs::Base
    def call
      broadcast :ok, ::Imports::Translations::QuestionImport.new(record.data.merge(file: record.file)).process!
    end
  end
end
