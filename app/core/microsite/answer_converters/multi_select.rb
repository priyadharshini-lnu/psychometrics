# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class MultiSelect < Base
      # FROM:
      #   { 'kind' => 'multi_select', 'selected' => ['a', 'c'] }
      # TO:
      #   [{ 'index' => 0, 'value' => true }, { 'index' => 2, 'value' => true }]
      def self.build_answers(result, _question)
        selected = result['selected']
        return nil if selected.blank?

        selected.map do |option|
          index = option_value_to_index(option)
          { 'index' => index, 'value' => true }
        end
      end
    end
  end
end
