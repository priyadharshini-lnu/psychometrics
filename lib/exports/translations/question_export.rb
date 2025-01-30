# frozen_string_literal: true

module Exports
  module Translations
    class QuestionExport < BaseCommand
      attr_accessor :question_id, :data

      def initialize(question_id, data = {})
        @question_id = question_id
        @data = data
      end

      def call
        package = ExcelSafe.new
        package.add_worksheet('QuestionTranslations') do |sheet|
          sheet.add_row ['Key', 'Default Locale / en', *(I18n.available_locales - [I18n.default_locale]).
            map { |locale| [I18n.t("languages.#{locale}"), locale].join(' / ') }]

          process_branch(data['question'], sheet, question_id)
        end
        broadcast :ok, package
      end

      def process_branch(data, sheet, question_id)
        translations = ::Translation.where(translateable_id: question_id, translateable_type: 'Question').
                       group_by(&:locale)
        data.each do |key, translation|
          new_row = ["question:#{question_id}:#{key}", translation]
          (I18n.available_locales - [I18n.default_locale]).each do |l|
            new_row << translations[l.to_s].try(:first).try(:props).try(:[], key)
          end
          sheet.add_row(new_row)
        end
      end
    end
  end
end
