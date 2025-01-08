# frozen_string_literal: true

module Exports
  module Translations
    class ReportExport
      def initialize(report, data = {})
        @package = ExcelSafe.new
        @package.add_worksheet('ReportTranslations') do |sheet|
          sheet.add_row ['Key', "Default Locale / #{report.default_language}",
                         *(I18n.available_locales - [report.default_language.to_sym]).
                           map do |locale|
                           [I18n.t("languages.#{locale}"), locale].join(' / ')
                         end]
          data.each do |translateable_type, translateables|
            translateables.each do |translateable_id, props|
              translations = ::Translation.
                             for_report(report.id).
                             where(translateable_id: translateable_id, translateable_type: translateable_type.classify).
                             group_by(&:locale)
              props.each do |key, translation|
                new_row = ["#{translateable_type}:#{translateable_id}:#{key}", translation]
                # Insert translation from Database
                (I18n.available_locales - [report.default_language.to_sym]).each do |l|
                  new_row << translations[l.to_s].try(:first).try(:props).try(:[], key)
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
