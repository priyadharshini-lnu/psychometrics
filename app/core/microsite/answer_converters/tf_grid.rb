# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class TfGrid < Base
      # FROM:
      #   { 'kind' => 'tf_grid', 'choices' => { 's1' => 'true', 's2' => 'false', 's3' => 'unknown' } }
      # TO (MatrixTable format):
      #   {
      #     'answers' => [
      #       { 'scale' => 0, 'value' => true, 'choice' => 0, 'recode_value' => 1 },  # s1 = True
      #       { 'scale' => 1, 'value' => true, 'choice' => 1, 'recode_value' => 2 },  # s2 = False
      #       { 'scale' => 2, 'value' => true, 'choice' => 2, 'recode_value' => 3 }   # s3 = Unknown
      #     ],
      #     'not_applicable' => null
      #   }
      #
      # recode_value: 1 = True, 2 = False, 3 = Unknown/Cannot Say
      # scale: 0 = True, 1 = False, 2 = Unknown/Cannot Say
      # choice: statement index (0-based, s1=0, s2=1, ...)
      SCALE_VALUES = { 'true' => 0, 'false' => 1, 'unknown' => 2 }.freeze
      RECODE_VALUES = { 'true' => 1, 'false' => 2, 'unknown' => 3 }.freeze

      def self.build_answers(result, _question)
        choices = result['choices']
        return nil if choices.blank?

        answers = choices.map do |statement_id, value|
          {
            'scale' => SCALE_VALUES[value] || SCALE_VALUES['unknown'],
            'value' => true,
            'choice' => statement_id_to_index(statement_id),
            'recode_value' => RECODE_VALUES[value] || RECODE_VALUES['unknown']
          }
        end

        {
          'answers' => answers,
          'not_applicable' => nil
        }
      end
    end
  end
end
