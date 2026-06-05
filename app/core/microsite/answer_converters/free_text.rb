# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class FreeText < Base
      # FROM:
      #   { 'kind' => 'free_text', 'text' => 'Some answer' }
      # TO:
      #   [{ 'index' => 0, 'value' => 'Some answer' }]
      def self.build_answers(result, _question)
        text = result['text']
        return nil if text.blank?

        [{ 'index' => 0, 'value' => text }]
      end
    end
  end
end
