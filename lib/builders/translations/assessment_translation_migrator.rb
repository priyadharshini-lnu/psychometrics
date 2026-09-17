# frozen_string_literal: true

module Builders
  module Translations
    class AssessmentTranslationMigrator
      attr_reader :assessment

      def initialize(assessment)
        @assessment = assessment
      end

      def call
        translations.each do |translation|
          update_translation(translation)
        end
      end

      private

      def translations
        ::Translation.where(resource_id: assessment.id, resource_type: 'Assessments::Common')
      end

      def update_translation(translation)
        return if translation.data['props'].present?

        translations_data = translation.props
        question_props = translation.data['props'] || {}

        case translation.translateable_type
          when 'Instructions'
            update_instructions_props(question_props, translations_data)
            translation.data = { 'props' => question_props }
          when 'Block'
            update_block_static_content_props(question_props, translations_data)
            translation.data = { 'props' => question_props }
          else
            update_generic_props(question_props, translations_data)
            update_campaign_factor_feedback_props(question_props, translations_data)
            update_gap_analysis_props(question_props, translations_data)
            update_matrix_table_props(question_props, translations_data)
            update_side_by_side_props(question_props, translations_data)
            update_slider_props(question_props, translations_data)
            update_text_entry_props(question_props, translations_data)

            custom_validations = extract_custom_validations(translations_data)
            validation = { 'customValidations' => custom_validations.map { |message| { 'message' => message } } }

            translation.data = { 'props' => question_props, 'validation' => validation }
        end

        translation.save!
      end

      def update_generic_props(props, translations)
        props['questionText'] = translations['questionText'] if translations['questionText']

        choices_texts = extract_choices_texts(translations)
        props['choicesTexts'] = choices_texts if choices_texts.any?
      end

      def update_instructions_props(props, translations)
        props['content'] = translations['content'] if translations['content'].present?
      end

      def update_block_static_content_props(props, translations)
        if translations['staticContent'].present?
          props['staticContent'] = { 'value' => translations['staticContent'] }
        end
      end

      def update_campaign_factor_feedback_props(props, translations)
        props['skillLabel'] = translations['skillLabel'] if translations['skillLabel'].present?
        props['feedbackLabel'] = translations['feedbackLabel'] if translations['feedbackLabel'].present?
        props['factorLabel'] = translations['factorLabel'] if translations['factorLabel'].present?
      end

      def update_gap_analysis_props(props, translations)
        props['tellUsText'] = translations['tellUsText'] if translations['tellUsText']
        props['categoriesText'] = translations['categoriesText'] if translations['categoriesText']

        (props['categoriesData'] || {}).each_with_index do |categories_datum, index|
          answers_texts = extract_answers_texts(translations, "categoriesDataText#{index + 1}")
          categories_datum['texts'] = answers_texts
        end
      end

      def update_matrix_table_props(props, translations)
        scale_points_texts = extract_scale_points_texts(translations)
        props['scalePointsTexts'] = scale_points_texts if scale_points_texts.any?
      end

      def update_side_by_side_props(props, translations)
        row_descriptions = extract_row_descriptions(translations)
        props['rowDescriptions'] = row_descriptions if row_descriptions.any?

        column_data_texts = extract_column_data_texts(translations)
        column_data_texts.each_with_index do |text, index|
          answers_texts = extract_answers_texts(translations, "answersTexts#{index + 1}")

          if props['columnsData'] && props['columnsData'][index]
            props['columnsData'][index]['text'] = text
            props['columnsData'][index]['answersTexts'] = answers_texts
          end
        end
      end

      def update_slider_props(props, translations)
        labels_texts = extract_labels_texts(translations)
        props['labelsTexts'] = labels_texts if labels_texts.any?
      end

      def update_text_entry_props(props, translations)
        props['title'] = translations['title'] if translations['title']
        props['titleDescription'] = translations['titleDescription'] if translations['titleDescription']
      end

      def extract_choices_texts(translations)
        translations.select { |key, _| key.start_with?('choicesTexts') }.map { |_, value| value }
      end

      def extract_answers_texts(translations, prefix)
        translations.select { |key, _| key.start_with?(prefix) }.map { |_, value| value }
      end

      def extract_scale_points_texts(translations)
        translations.select { |key, _| key.start_with?('scalePointsTexts') }.map { |_, value| value }
      end

      def extract_row_descriptions(translations)
        translations.select { |key, _| key.start_with?('rowDescriptions') }.map { |_, value| value }
      end

      def extract_column_data_texts(translations)
        translations.select { |key, _| key.start_with?('text') }.map { |_, value| value }
      end

      def extract_labels_texts(translations)
        translations.select { |key, _| key.start_with?('labelsTexts') }.map { |_, value| value }
      end

      def extract_custom_validations(translations)
        translations.select { |k, _| k.start_with?('customValidationText_') }.values
      end
    end
  end
end
