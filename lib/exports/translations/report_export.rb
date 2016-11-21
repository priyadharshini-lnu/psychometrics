module Exports
  module Translations
    class ReportExport
      def initialize(report_id, data = {})
        @package = Axlsx::Package.new
        wb = @package.workbook
        wb.add_worksheet(name: 'ReportTranslations') do |sheet|
          sheet.add_row ['key', 'en', *Settings.languages]
          data.each do |translateable_type, translateables|
            translateables.each do |translateable_id, props|
              translations = ::Translation.
                             for_report(report_id).
                             where(translateable_id: translateable_id, translateable_type: translateable_type.classify).
                             group_by(&:locale)
              props.each do |key, translation|
                new_row = ["#{translateable_type}:#{translateable_id}:#{key}", translation]
                # Insert translation from Database
                Settings.languages.each do |l|
                  new_row << translations[l].try(:first).try(:props).try(:[], key)
                end
                sheet.add_row(new_row)
              end
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
