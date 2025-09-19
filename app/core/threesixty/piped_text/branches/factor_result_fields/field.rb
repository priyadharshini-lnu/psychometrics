# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module FactorResultFields
        class Field < ::PipedText::BaseField
          def call
            return broadcast :ok, nil unless factor_id

            key = path.second
            mapped_key = possible_fields[key]

            return broadcast :ok, nil unless mapped_key

            value = get_field_value(mapped_key)
            broadcast :ok, value
          end

          private

          def get_field_value(mapped_key)
            scoring = context[:users_result].scoring[factor_id]
            return nil unless scoring

            scoring[mapped_key.to_s]
          end

          def possible_fields
            {
              'totalQuestions' => :total_questions,
              'questionsCorrect' => :questions_correct,
              'questionsIncorrect' => :questions_incorrect,
              'questionsAttempted' => :questions_attempted,
              'questionsNotAttempted' => :questions_not_attempted,
              'questionsPartialCorrect' => :questions_partial_correct,
              'percentage' => :percentage,
              'score' => :score
            }
          end

          def factor_id
            params['factor_id']
          end
        end
      end
    end
  end
end
