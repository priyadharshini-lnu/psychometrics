# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class TfGrid < Base
      # FROM:
      #   { 'kind' => 'tf_grid', 'choices' => { 's1' => 'true', 's2' => 'false', 's3' => 'unknown' } }
      # TO (MatrixTable format):
      #   {
      #     'answers' => [
      #       { 'scale' => 0, 'choice' => 0, 'value' => true },  # s1 = True, scale 0
      #       { 'scale' => 1, 'choice' => 1, 'value' => true }   # s2 = False, scale 1
      #     ],
      #     'not_applicable' => { '2' => true }  # s3 = unknown/Cannot Say
      #   }
      #
      # Scale mapping: 0 = True, 1 = False
      # Unknown/Cannot Say is handled via not_applicable hash
      TRUE_SCALE = 0
      FALSE_SCALE = 1

      def self.build_answers(result, _question)
        choices = result['choices']
        return nil if choices.blank?

        answers = []
        not_applicable = {}

        choices.each do |statement_id, value|
          choice_index = statement_id_to_index(statement_id)

          case value
            when 'true'
              answers << { 'scale' => TRUE_SCALE, 'choice' => choice_index, 'value' => true }
            when 'false'
              answers << { 'scale' => FALSE_SCALE, 'choice' => choice_index, 'value' => true }
            else
              # "unknown" / "Cannot Say" - mark as not applicable
              not_applicable[choice_index.to_s] = true
          end
        end

        {
          'answers' => answers,
          'not_applicable' => not_applicable
        }
      end
    end
  end
end
