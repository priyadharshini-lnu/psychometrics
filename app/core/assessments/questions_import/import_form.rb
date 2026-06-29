# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class ImportForm < Rectify::Form
      mimic :assessment_question_import_form

      ALLOWED_HEADERS = ['Block', 'Question', 'Question Property', 'Required Validation', 'Scoring',
                         'AI Scoring Config'].freeze

      attribute :file, Object
      attribute :roo_excel, Object

      validates :file, presence: true, if: -> { roo_excel.nil? }
      validates :file,
                file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                             'application/xlsx'], message: :invalid_format },
                                   if: -> { file.present? }

      validate :validate_headers
      validate :validate_sub_headers
      validate :validate_rows

      def validate_headers
        return if errors.present?

        unknown_headers = headers - ALLOWED_HEADERS
        if unknown_headers.present?
          errors.add(
            :base,
            I18n.t(
              'administration.assessment_question_import.errors.invalid_headers',
              headers: Utility::String.join_into_sentence(unknown_headers.uniq)
            )
          )
        end
      end

      def validate_sub_headers
        return if errors.present?

        sub_headers.each_with_index do |sub_header, index|
          header = headers[index]
          unless header
            errors.add(
              :base,
              I18n.t('administration.assessment_question_import.errors.doesnt_have_header', sub_header: sub_header)
            )
          end
          next if allowed_sub_headers_for_header[header]&.include?(sub_header)

          errors.add(
            :base,
            I18n.t(
              'administration.assessment_question_import.errors.invalid_sub_header',
              header: header, sub_header: sub_header
            )
          )
        end
      end

      def validate_rows
        return if errors.present?

        processed_rows.each_with_index do |row, index|
          form = Assessments::QuestionsImport::ProcessedRowForm.new(row).with_context(
            assessment: context.assessment,
            allowed_factor_names: allowed_factor_names
          )
          next if form.valid?

          form.errors.full_messages.each do |message|
            errors.add(:base, "Row #{index + 3}: #{message}") unless form.valid?
          end
        end
      end

      def processed_rows
        @processed_rows ||= Assessments::QuestionsImport::ProcessRows.call!(rows)
      end

      private

      def allowed_factor_names
        @allowed_factor_names ||= context.assessment.dimension.all_factors.pluck(:name)
      end

      def allowed_sub_headers_for_header
        @allowed_sub_headers_for_header ||= {
          'Block' => %w[Name],
          'Question' => %w[ID Name Type],
          'Question Property' => [
            'type', 'questionText', 'answersType', 'choicesTexts', 'scalePointsTexts', 'randomization.type',
            'randomization.questions', 'notApplicable', 'notApplicableLabel',
            'duration', 'maxTakes', 'scoreWithAIEnabled', 'enableTranscription',
            'aiScoringModelAnswer', 'aiScoringKeywords'
          ],
          'Required Validation' => %w[Type],
          'Scoring' => %w[Factors],
          'AI Scoring Config' => %w[what_to_look_for score_definitions]
        }
      end

      def headers
        @headers ||= rows[0]
      end

      def sub_headers
        @sub_headers ||= rows[1]
      end

      def rows
        @rows ||= roo_excel&.to_a || Roo::Excelx.new(file.path).to_a
      end
    end
  end
end
