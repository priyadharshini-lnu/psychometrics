# frozen_string_literal: true

module Reports
  class GetTranslationWithPipetextReplaced < BaseCommand
    private_attr_reader :report, :piped_text_context, :locale

    def initialize(report, options)
      @report = report
      @piped_text_context = options[:piped_text_context]
      @locale = options[:locale]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      broadcast :ok, {} if translations.empty?

      replace_pipetext_for_question(translations)
      replace_pipetext_for_report_modules(translations)

      broadcast :ok, translations
    end

    private

    def replace_pipetext_for_question(translations)
      return unless translations['question']

      translations['question'] = translations['question'].each_with_object({}) do |(question_id, question_details), acc|
        next unless question_details

        question_text = question_details['questionText']
        question_text = Threesixty::PipedText::Perform.call!(question_text, piped_text_context)
        acc[question_id] = question_details.merge('questionText' => question_text)
      end
    end

    def replace_pipetext_for_report_modules(translations)
      return unless translations['reports/module']

      translations['reports/module'] = translations['reports/module'].
                                       each_with_object({}) do |(module_id, module_details), acc|
        module_text = module_details['text']
        module_text = Threesixty::PipedText::Perform.call!(module_text, piped_text_context)
        acc[module_id] = module_details.merge('text' => module_text)
      end
    end
  end
end
