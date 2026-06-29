# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class ProcessedRowForm < Rectify::Form
      QUESTION_PROPERTY_FORMS = {
        'TextEntry' => Assessments::QuestionsImport::QuestionPropertyForm::TextEntry,
        'MultipleChoice' => Assessments::QuestionsImport::QuestionPropertyForm::MultipleChoice,
        'MatrixTable' => Assessments::QuestionsImport::QuestionPropertyForm::MatrixTable,
        'StaticContent' => Assessments::QuestionsImport::QuestionPropertyForm::StaticContent,
        'AudioResponse' => Assessments::QuestionsImport::QuestionPropertyForm::AudioResponse,
        'VideoResponse' => Assessments::QuestionsImport::QuestionPropertyForm::VideoResponse
      }.freeze
      SCORING_ALLOWED_QUESTION_TYPES = %w[MultipleChoice MatrixTable].freeze
      AI_SCORING_ALLOWED_QUESTION_TYPES = %w[TextEntry AudioResponse VideoResponse].freeze

      attribute :block, Hash, default: {}
      attribute :question, Hash, default: {}
      attribute :question_property, Hash, default: {}
      attribute :required_validation, Hash, default: {}
      attribute :scoring, Hash, default: {}
      attribute :ai_scoring_config, Hash, default: {}

      validate :validate_block
      validate :validate_question
      validate :validate_question_property
      validate :validate_required_validation
      validate :validate_scoring
      validate :validate_ai_scoring_config

      delegate :assessment, to: :context

      private

      def validate_block
        form = Assessments::QuestionsImport::BlockForm.new(block)
        add_errors_from_child_form(form)
      end

      def validate_question
        form = Assessments::QuestionsImport::QuestionForm.new(question)
        add_errors_from_child_form(form)

        if question['id'].present? && !assessment.questions.exists?(id: question['id'])
          errors.add(:base, I18n.t(
                              'administration.assessment_question_import.errors.invalid_question',
                              question_id: question['id']
                            ))
        end
      end

      def validate_question_property
        form_class = QUESTION_PROPERTY_FORMS[question['type']]
        return unless form_class

        form = form_class.new(question_property)
        add_errors_from_child_form(form)
      end

      def validate_required_validation
        form = Assessments::QuestionsImport::RequiredValidationForm.new(required_validation)
        add_errors_from_child_form(form)
      end

      def validate_scoring
        unavailable_factors = scoring.keys - (context.allowed_factor_names || [])
        if unavailable_factors.present?
          errors.add(
            :base,
            I18n.t(
              'administration.assessment_question_import.errors.unavailable_factors',
              unavailable_factor_names: Utility::String.join_into_sentence(unavailable_factors)
            )
          )
          return
        end

        scoring.each do |factor_name, comma_separated_scores|
          next if comma_separated_scores.blank?

          unless SCORING_ALLOWED_QUESTION_TYPES.include?(question['type'])
            errors.add(
              :base,
              I18n.t('administration.assessment_question_import.errors.scores_not_allowed')
            )
          end
          if comma_separated_scores.split(',').all? { |score| score.blank? || score.strip.match?(/\A\d+\.{0,1}\d*\z/) }
            next
          end

          errors.add(
            :base,
            I18n.t('administration.assessment_question_import.errors.invalid_scores', factor_name: factor_name)
          )
        end
      end

      def validate_ai_scoring_config
        return if ai_scoring_config.blank?

        unavailable_factors = ai_scoring_config.keys - (context.allowed_factor_names || [])
        if unavailable_factors.present?
          errors.add(
            :base,
            I18n.t(
              'administration.assessment_question_import.errors.unavailable_factors',
              unavailable_factor_names: Utility::String.join_into_sentence(unavailable_factors)
            )
          )
          return
        end

        unless AI_SCORING_ALLOWED_QUESTION_TYPES.include?(question['type'])
          errors.add(
            :base,
            I18n.t('administration.assessment_question_import.errors.ai_scoring_not_allowed')
          )
        end
      end

      def add_errors_from_child_form(form)
        return if form.valid?

        form.errors.messages.each_value do |messages|
          messages.each { |message| errors.add(:base, message) }
        end
      end
    end
  end
end
