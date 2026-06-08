# frozen_string_literal: true

module Assessments
  module Export
    class Questions < BaseCommand
      EXPORT_HEADERS = {
        block: {
          header: 'Block',
          sub_headers: ['Name']
        },
        question: {
          header: 'Question',
          sub_headers: %w[ID Name Type]
        },
        question_property: {
          header: 'Question Property',
          sub_headers: [
            'type',
            'questionText',
            'answersType',
            'choicesTexts',
            'scalePointsTexts',
            'notApplicable',
            'notApplicableLabel',
            'randomization.type',
            'randomization.questions'
          ]
        },
        required_validation: {
          header: 'Required Validation',
          sub_headers: ['Type']
        },
        scoring: {
          header: 'Scoring',
          sub_headers: ['Factors']
        }
      }.freeze

      REPEATING_SUBHEADERS = %w[choicesTexts scalePointsTexts].freeze

      QUESTIONS_TYPE_TO_EXPORT = %w[TextEntry MultipleChoice MatrixTable StaticContent].freeze
      SCORING_ALLOWED_QUESTION_TYPES = %w[MultipleChoice MatrixTable].freeze

      private_attr_reader :assessment

      def initialize(assessment)
        @assessment = assessment
      end

      def call
        package = ExcelSafe.new

        package.add_worksheet('Questions') do |sheet|
          wrapped_style = sheet.styles.add_style(alignment: { wrap_text: true })

          sheet.add_row(generate_headers)
          sheet.add_row(generate_sub_headers)

          questions_to_export.each do |question|
            sheet.add_row(build_question_row(question), style: wrapped_style)
          end
        end

        broadcast :ok, package
      end

      private

      def questions_to_export
        @questions_to_export ||= assessment.questions.
                                 not_deleted.
                                 where(type: QUESTIONS_TYPE_TO_EXPORT).
                                 includes(:block, :factors_scorings).
                                 order(:block_id)
      end

      def generate_headers
        EXPORT_HEADERS.flat_map do |_, config|
          config[:sub_headers].flat_map do |sub_header|
            if REPEATING_SUBHEADERS.include?(sub_header)
              [config[:header]] * max_column_counts[sub_header]
            else
              config[:header]
            end
          end
        end
      end

      def generate_sub_headers
        EXPORT_HEADERS.flat_map do |_, config|
          config[:sub_headers].flat_map do |sub_header|
            if REPEATING_SUBHEADERS.include?(sub_header)
              [sub_header] * max_column_counts[sub_header]
            else
              sub_header
            end
          end
        end
      end

      def build_question_row(question)
        choices = question.props['choicesTexts'] || []
        scale_points = question.props['scalePointsTexts'] || []

        [
          question.block.name,
          question.id,
          question.name,
          question.type,
          question.props['type'],
          question.props['questionText'],
          question.props['answersType'],
          *choices.fill(nil, choices.size...max_column_counts['choicesTexts']),
          *scale_points.fill(nil, scale_points.size...max_column_counts['scalePointsTexts']),
          question.props['notApplicable']&.to_s,
          question.props['notApplicableLabel'],
          question.props.dig('randomization', 'type'),
          question.props.dig('randomization', 'questions'),
          question.required_validation['type'],
          extract_factor_scoring(question)
        ]
      end

      def extract_factor_scoring(question)
        return nil unless SCORING_ALLOWED_QUESTION_TYPES.include?(question.type)

        question.factors_scorings.filter_map do |scoring|
          next unless scoring.factor

          factor_name = scoring.factor.name
          values = scoring.props.map { |p| p['value'] }.join(',')
          "#{factor_name}: #{values}"
        end.join("\r\n")
      end

      def max_column_counts
        REPEATING_SUBHEADERS.index_with do |key|
          questions_to_export.map { |q| q.props[key]&.size.to_i }.max || 0
        end
      end
    end
  end
end
