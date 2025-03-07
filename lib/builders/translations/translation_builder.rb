# frozen_string_literal: true

require 'jsonpath'

module Builders
  module Translations
    class TranslationBuilder
      ALLOWED_TRANSLATION_PATHS = {
        props: [
          'staticContent',
          'questionText',
          'notApplicableLabel',
          'choicesTexts[*]',
          'labelsTexts[*]',
          'scalePointsTexts[*]',
          'rowDescriptions[*]',
          'columnsData[*](text, answersTexts)',
          'tellUsText',
          'categoriesText',
          'categoriesData[*]',
          'skillLabel',
          'feedbackLabel',
          'factorLabel',
          'title',
          'titleDescription',
          'labelLow',
          'labelHigh'
        ],
        validation: [
          'customValidations[*](message)'
        ]
      }.freeze

      attr_reader :question_params

      def initialize(question_params)
        @question_params = question_params
      end

      def call
        extract_allowed_data
      end

      def filter_allowed_props
        filtered_props = {}

        ALLOWED_TRANSLATION_PATHS.each_value do |paths|
          paths.each do |path|
            json_path = JsonPath.new(path)
            extracted_values = json_path.on(question_params)

            next if extracted_values.empty?

            key = path.gsub(/\[\*\].*/, '')
            value = path.include?('[*]') ? extracted_values.flatten : extracted_values.first

            filtered_props[key] = value
          end
        end

        # Remove empty items
        filtered_props.reject! { |_, value| value.nil? || (value.respond_to?(:empty?) && value.empty?) }

        filtered_props
      end

      private

      def extract_allowed_data
        ALLOWED_TRANSLATION_PATHS.each_with_object({ props: {}, validation: {} }) do |(column, paths), hash|
          data = question_params[column]

          paths.each do |path|
            result = JsonPath.new(path).on(data)
            next if result.empty?

            if path.include?('[*]')
              hash[column][path.gsub(/\[\*\].*/, '')] = result
            else
              hash[column][path] = result.first
            end
          end
        end
      end
    end
  end
end
