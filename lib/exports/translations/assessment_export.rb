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

          if @assessment.translations_migrated?
            process_blocks(sheet)
            process_instructions(sheet)
            process_questions(sheet)
          else
            process_branch('block', data, sheet, assessment_id)
            process_branch('instructions', data, sheet, assessment_id)
            process_branch('question', data, sheet, assessment_id)
          end
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

      def process_questions(sheet)
        questions = @assessment.questions

        questions.each do |question|
          translations = fetch_translations(@assessment.id, question.id, 'Question')

          filterd_question_props = Builders::Translations::TranslationBuilder.
                                   new(question.props.merge(question.validation)).
                                   filter_allowed_props

          filterd_question_props.each do |key, translation|
            translation_key = "question:#{question.id}:#{key}"
            process_translations(sheet, translation_key, translation, translations, [key])
          end
        end
      end

      def process_blocks(sheet)
        blocks = @assessment.blocks

        blocks.each do |block|
          translations = fetch_translations(@assessment.id, block.id, 'Block')
          filterd_block_props = {}

          if block.props['staticContent'].present?
            filterd_block_props['staticContent'] =
              { 'value' => block.props['staticContent']['value'] }
          end

          if block.props['not_applicable'].present?
            filterd_block_props['not_applicable'] =
              block.props['not_applicable']
          end

          filterd_block_props.each do |key, translation|
            translation_key = "block:#{block.id}:#{key}"
            process_translations(sheet, translation_key, translation, translations, [key])
          end
        end
      end

      def process_instructions(sheet)
        instructions = @assessment.instructions['content'] if @assessment.instructions
        translations = ::Translation.
                       for_assessment(@assessment.id).
                       where(translateable_type: 'Instructions').
                       group_by(&:locale)

        process_translations(sheet, 'instructions:0:content', instructions, translations, ['content'])
      end

      private

      def process_translations(sheet, translation_key, translation, translations, translations_path)
        case translation
          when ::Hash
            translation.each do |param_key, value|
              new_translation_key = "#{translation_key}.#{param_key}"
              new_translation_path = [translations_path, param_key].flatten
              process_translations(sheet, new_translation_key, value, translations, new_translation_path)
            end
          when ::Array
            translation.each_with_index do |value, index|
              new_translation_key = "#{translation_key}[#{index}]"
              new_translation_path = [translations_path, index].flatten
              process_translations(sheet, new_translation_key, value, translations, new_translation_path)
            end
          when ::String
            process_single_translation(sheet, translation_key, translation, translations, translations_path)
        end
      end

      def process_single_translation(sheet, translation_key, translation, translations, translations_path)
        new_row = [translation_key, translation]
        (I18n.available_locales - [@assessment.default_language.to_sym]).each do |locale|
          translation = translations[locale.to_s]&.first&.data

          new_row << (translation&.dig('props', *translations_path) ||
                        translation&.dig('validation', *translations_path))
        end

        sheet.add_row(new_row)
      end

      def fetch_translations(assessment_id, translateable_id, translateable_type)
        ::Translation.
          for_assessment(assessment_id).
          where(translateable_id: translateable_id, translateable_type: translateable_type).
          group_by(&:locale)
      end
    end
  end
end
