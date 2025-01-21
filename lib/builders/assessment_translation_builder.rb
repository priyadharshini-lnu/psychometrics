# frozen_string_literal: true

module Builders
  class AssessmentTranslationBuilder
    attr_accessor :assessment, :assessment_params, :selected_locale

    def initialize(assessment, assessment_params, selected_locale)
      @assessment = assessment
      @assessment_params = assessment_params
      @selected_locale = selected_locale
    end

    def save
      update_instruction_translations
      update_blocks
    end

    private

    def update_blocks
      assessment_params[:blocks].each do |block_params|
        id = block_params.delete(:id)
        questions = block_params.delete(:questions)
        block = assessment.blocks.find_or_initialize_by(id: id)

        update_block_translations(block, block_params)

        update_questions(questions)
      end
    end

    def update_questions(questions)
      questions.each do |question_params|
        id = question_params.delete(:id)
        question = assessment.questions.find(id)

        update_question_translations(question, question_params)
      end
    end

    def update_instruction_translations
      instructions = assessment_params.slice(:instructions)

      # Assuming 0 is used for instructions
      translation = find_or_initialize_translation(0, 'Instructions')

      translation.data['props'] = { content: instructions['instructions']['content'] }
      translation.save!
    end

    def update_block_translations(block, block_params)
      return if block_params.dig('props', 'staticContent').blank?

      translation = find_or_initialize_translation(block.id, 'Block')

      translation.data['props'] =
        { 'staticContent' => { 'value' => block_params.dig('props', 'staticContent', 'value') } }
      translation.save!
    end

    def update_question_translations(question, question_params)
      translation = find_or_initialize_translation(question.id, 'Question')

      question_props = Builders::Translations::TranslationBuilder.new(question_params).call
      translation.data = question_props
      translation.save!
    end

    def find_or_initialize_translation(translateable_id, translateable_type)
      Translation.find_or_initialize_by(
        translateable_id: translateable_id,
        translateable_type: translateable_type,
        resource_id: assessment.id,
        resource_type: assessment.class.name,
        locale: selected_locale
      )
    end
  end
end
