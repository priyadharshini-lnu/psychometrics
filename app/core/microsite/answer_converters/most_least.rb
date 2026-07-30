# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class MostLeast < Base
      # FROM:
      #   { 'kind' => 'most_least', 'most' => 'a', 'least' => 'b' }
      # TO (PickGroupRank format):
      #   [
      #     { 'scale' => 0, 'value' => 0, 'choice' => 0 },  # most: a = index 0
      #     { 'scale' => 1, 'value' => 0, 'choice' => 1 }   # least: b = index 1
      #   ]
      #
      # scale: Group ID (0 = most, 1 = least)
      # value: Rank within group — always 0 since there is exactly one item per group
      # choice: option index (0-based, a=0, b=1, ...)
      MOST_SCALE = 0
      LEAST_SCALE = 1

      def self.build_answers(result, _question)
        most = result['most']
        least = result['least']
        return nil if most.blank? || least.blank?

        [
          { 'scale' => MOST_SCALE, 'value' => 0, 'choice' => option_value_to_index(most) },
          { 'scale' => LEAST_SCALE, 'value' => 0, 'choice' => option_value_to_index(least) }
        ]
      end
    end
  end
end
