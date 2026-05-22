# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class Ranked < Base
      # FROM:
      #   { 'kind' => 'ranked', 'order' => ['opt-1', 'opt-2', 'opt-3', 'opt-4'] }
      # TO (0-based ranks to match Lighthouse RankOrder format):
      #   [{ 'index' => 0, 'value' => 0 }, { 'index' => 1, 'value' => 1 }, ...]
      #
      # The order array contains options in ranked order (first = rank 0, second = rank 1, etc.)
      # Each entry maps the option's index to its rank value (0-based)
      def self.build_answers(result, _question)
        order = result['order']
        return nil if order.blank?

        order.each_with_index.map do |option, rank|
          index = option_value_to_index(option)
          { 'index' => index, 'value' => rank }
        end
      end
    end
  end
end
