# frozen_string_literal: true

module Microsite
  class TransformAnswers < BaseCommand
    CONVERTERS = {
      'single_choice' => AnswerConverters::SingleChoice,
      'multi_select' => AnswerConverters::MultiSelect,
      'free_text' => AnswerConverters::FreeText,
      'ranked' => AnswerConverters::Ranked,
      'tf_grid' => AnswerConverters::TfGrid,
      'form' => AnswerConverters::Form
    }.freeze

    attr_reader :microsite_user_assessment

    def initialize(microsite_user_assessment)
      @microsite_user_assessment = microsite_user_assessment
    end

    def call
      return broadcast(:invalid, 'No raw answers') if raw_answers.blank?
      return broadcast(:invalid, 'No question mappings') if question_mappings.blank?

      transformed = {}

      raw_answers.each do |raw_answer|
        microsite_question_id = raw_answer['questionId']
        lighthouse_question_id = question_mappings[microsite_question_id]

        next unless lighthouse_question_id

        lighthouse_question = questions_by_id[lighthouse_question_id.to_i]
        next unless lighthouse_question

        canonical_answer = build_canonical_answer(raw_answer, lighthouse_question)
        transformed[lighthouse_question_id.to_s] = canonical_answer if canonical_answer
      end

      broadcast(:ok, transformed)
    end

    private

    def raw_answers
      microsite_user_assessment.answers
    end

    def assessment
      @assessment ||= microsite_user_assessment.user_assessment.assessment
    end

    def question_mappings
      @question_mappings ||= assessment.external_settings&.dig('question_mappings') || {}
    end

    def questions_by_id
      @questions_by_id ||= Question.where(id: question_mappings.values.compact).index_by(&:id)
    end

    def microsite_questions
      @microsite_questions ||= microsite_assessment&.metadata&.dig('questions') || {}
    end

    def microsite_assessment
      @microsite_assessment ||= MicrositeAssessment.find_by(
        project_id: microsite_user_assessment.user_assessment.project&.id,
        product_id: assessment.external_assessment_id
      )
    end

    def build_canonical_answer(raw_answer, question)
      result = raw_answer['result']
      kind = result['kind']

      converter = CONVERTERS[kind]
      unless converter
        Rails.logger.warn("Unknown microsite answer kind: #{kind}")
        return nil
      end

      converter_result = if kind == 'form'
                           microsite_question = microsite_questions[raw_answer['questionId']]
                           converter.build_answers(result, question, microsite_question)
                         else
                           converter.build_answers(result, question)
                         end
      return nil unless converter_result

      # TfGrid returns a hash with 'answers' and 'not_applicable' keys
      # Other converters return just an array of answers
      if converter_result.is_a?(Hash) && converter_result.key?('answers')
        answers = converter_result['answers']
        not_applicable = converter_result['not_applicable'] || {}
      else
        answers = converter_result
        not_applicable = {}
      end

      {
        'answers' => answers,
        'question_id' => question.id,
        'duration' => nil,
        'not_applicable' => not_applicable.presence || false,
        'dirty' => false
      }
    end
  end
end
