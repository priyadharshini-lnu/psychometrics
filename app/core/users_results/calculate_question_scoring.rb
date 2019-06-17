# frozen_string_literal: true

module UsersResults
  class CalculateQuestionScoring < BaseCommand
    AVAILABLE_TYPES = %w[MatrixTable SideBySide].freeze

    def initialize(users_result)
      @users_result = users_result
    end

    def call
      return broadcast(:ok, []) unless users_result.completed?

      questions = Question.where(assessment_id: users_result.assessment_id, type: AVAILABLE_TYPES).all

      factors_scoring_map = FactorsScoring.
        where(assessment_id: users_result.assessment_id, question_id: questions.map(&:id)).
        where('json_array_length(props) > 0').
        group_by(&:question_id)

      question_scoring =
        questions.map do |question|
          scoring_class = "::Scoring::#{question.type}"
          result = users_result.answers[question.id.to_s]
          factor_scoring = factors_scoring_map[question.id].try(:first)
          value_obj =
            if result && factor_scoring && !factor_scoring.props.empty?
              begin
                scoring_class.constantize.new.calculate(question, result, factor_scoring.props)
              rescue NameError => e
                raise "Scoring class is not implemented for question type #{question.type}. Check lib/scoring for details"
              end
            else
              {}
            end
          value_obj[:value] ? { question_id: question.id, value: value_obj[:value], options: value_obj[:options] } : nil
        end
      broadcast :ok, question_scoring.compact
    end

    private

    attr_reader :users_result
  end
end
