# frozen_string_literal: true

module UsersResults
  class CalculateQuestionScoring < BaseCommand
    AVAILABLE_TYPES = %w[MatrixTable SideBySide].freeze

    def initialize(users_result)
      @users_result = users_result
    end

    def call
      return broadcast(:ok, []) unless users_result.completed?

      questions = Question.where(assessment_id: users_result.assessment_id, type: AVAILABLE_TYPES)

      factors_scoring_map = FactorsScoring.
        where(assessment_id: users_result.assessment_id, question_id: questions.map(&:id)).
        group_by(&:question_id)

      question_scoring =
        questions.map do |question|
          scoring_class = "::Scoring::#{question.type}"
          result = users_result.answers[question.id.to_s]
          factor_scoring = factors_scoring_map[question.id].try(:first)

          value =
            if result && factor_scoring && !factor_scoring.props.empty?
              scoring_class.constantize.new.calculate(question, result, factor_scoring.props)
            end

          value ? { question_id: question.id, value: value, options: [] } : nil
        end
      broadcast :ok, question_scoring.compact
    end

    private

    attr_reader :users_result
  end
end
