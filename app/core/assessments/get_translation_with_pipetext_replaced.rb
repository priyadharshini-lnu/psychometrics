# frozen_string_literal: true

module Assessments
  class GetTranslationWithPipetextReplaced < BaseCommand
    private_attr_reader :assessment, :piped_text_context, :locale, :ignore_pipetext_substitution

    def initialize(assessment, options)
      @assessment = assessment
      @piped_text_context = options[:piped_text_context]
      @locale = options[:locale]
      @ignore_pipetext_substitution = options[:ignore_pipetext_substitution] || false
    end

    def call
      translations = Translation.to_hash_for_assessment(assessment.id, locale,
                                                        translations_migrated: assessment.translations_migrated?)
      broadcast :ok, {} if translations.empty?

      I18n.with_locale(locale) do
        replace_pipetext_for_question(translations)
        replace_pipetext_for_block(translations)
      end

      broadcast :ok, translations
    end

    private

    def replace_pipetext_for_question(translations)
      return unless translations['question']

      translations['question'] = translations['question'].each_with_object({}) do |(question_id, question_details), acc|
        question_text = question_details['questionText']
        unless ignore_pipetext_substitution
          question_text = Threesixty::PipedText::Perform.call!(question_text, piped_text_context)
        end
        acc[question_id] = question_details.merge('questionText' => question_text)
      end
    end

    def replace_pipetext_for_block(translations)
      return unless translations['block']

      translations['block'] = translations['block'].
                              each_with_object({}) do |(block_id, block_details), acc|
        static_content = block_details['staticContent']
        unless ignore_pipetext_substitution
          static_content = Threesixty::PipedText::Perform.call!(static_content, piped_text_context)
        end
        acc[block_id] = block_details.merge('staticContent' => static_content)
      end
    end
  end
end
