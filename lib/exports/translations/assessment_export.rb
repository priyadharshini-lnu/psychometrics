module Exports
  module Translations
    class AssessmentExport
      def initialize(assessment_id, data = {})
        @package = Axlsx::Package.new
        wb = @package.workbook
        wb.add_worksheet(name: 'AssessmentTranslations') do |sheet|
          sheet.add_row ['key', 'en', *Settings.languages]
          data['questions'].each do |question_id, props|
            translations = ::Translation.
                           for_assessment(assessment_id).
                           where(translateable_id: question_id).
                           group_by(&:locale)
            props.each do |key, translation|
              new_row = ["#{question_id}:#{key}", translation]
              # Insert translation from Database
              Settings.languages.each do |l|
                new_row << translations[l].try(:first).try(:props).try(:[], key)
              end
              sheet.add_row(new_row)
            end
          end
        end
      end

      def render
        @package
      end
    end
  end
end
