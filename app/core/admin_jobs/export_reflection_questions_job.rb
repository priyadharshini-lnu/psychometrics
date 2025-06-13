# frozen_string_literal: true

module AdminJobs
  class ExportReflectionQuestionsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.reflection_questions.export.details'), file_link]]
    end

    def headers
      %w[
        ID
        Mandatory
        MinWords
        MaxWords
      ] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      ReflectionQuestion.where(project_id: record.data['project_id'])
    end

    def data_row(reflection_question)
      locales = ::ReflectionQuestionTranslation.where(reflection_question_id: reflection_question.id).group_by(&:locale)
      [
        reflection_question.id,
        reflection_question.mandatory ? 'yes' : 'no',
        reflection_question.min_words,
        reflection_question.max_words
      ] + I18n.available_locales.map do |locale|
        locales[locale.to_s]&.first&.question
      end
    end

    def file_name
      "#{project.name}-reflection-questions.csv"
    end
  end
end
