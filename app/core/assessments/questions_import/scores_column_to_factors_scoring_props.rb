# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class ScoresColumnToFactorsScoringProps < BaseCommand
      private_attr_reader :question, :comma_separated_scores, :scores

      def initialize(question, comma_separated_scores)
        @question = question
        @comma_separated_scores = comma_separated_scores
        @scores = pre_process_scores
      end

      def call
        return broadcast :ok, multiple_choice_scores if question.type == 'MultipleChoice'

        return broadcast :ok, matrix_table_scores if question.type == 'MatrixTable'
      end

      private

      def multiple_choice_scores
        scores.map.with_index do |score, index|
          { 'index' => index, 'value' => score }
        end
      end

      def matrix_table_scores
        choice = 0
        scale = 0
        scores.map.with_index do |score, index|
          props = { 'choice' => choice, 'scale' => scale, 'value' => score }
          scale = (index + 1) % question.props['scalePoints']
          choice += 1 if scale.zero?
          props
        end
      end

      def pre_process_scores
        comma_separated_scores.split(',').map do |score|
          score.strip!
          score.match?(/\d+/) ? score.to_i : score.to_f
        end
      end
    end
  end
end
