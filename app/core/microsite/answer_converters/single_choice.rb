# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class SingleChoice < Base
      # FROM:
      #   { 'kind' => 'single_choice', 'selected' => 'a' }
      # TO:
      #   [{ 'index' => 0, 'value' => true }]
      def self.build_answers(result, _question)
        selected = result['selected']
        return nil if selected.blank?

        index = option_value_to_index(selected)
        [{ 'index' => index, 'value' => true }]
      end
    end
  end
end
