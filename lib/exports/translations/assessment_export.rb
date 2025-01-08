# frozen_string_literal: true

module Exports
  module Translations
    class AssessmentExport
      def initialize(assessment_id, data = {})
        @package = ExcelSafe.new
        @assessment = ::Assessment.find(assessment_id)
        @package.add_worksheet('AssessmentTranslations') do |sheet|
          sheet.add_row [
            'Key', "Default Locale / #{@assessment.default_language}",
            *(I18n.available_locales - [@assessment.default_language.to_sym]).map do |locale|
              [I18n.t("languages.#{locale}"), locale].join(' / ')
            end
          ]

          process_branch('block', data, sheet, assessment_id)
          process_branch('question', data, sheet, assessment_id)
          process_branch('instructions', data, sheet, assessment_id)
        end
      end

      def render
        @package
      end

      def process_branch(name, data, sheet, assessment_id)
        data[name].each do |id, props|
          translations = ::Translation.
                         for_assessment(assessment_id).
                         where(translateable_id: id, translateable_type: name.capitalize).
                         group_by(&:locale)
          props.each do |key, translation|
            new_row = ["#{name}:#{id}:#{key}", translation]
            (I18n.available_locales - [@assessment.default_language.to_sym]).each do |l|
              new_row << translations[l.to_s].try(:first).try(:props).try(:[], key)
            end
            sheet.add_row(new_row)
          end
        end
      end
    end
  end
end
