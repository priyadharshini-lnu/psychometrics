# frozen_string_literal: true

module UsersResults
  class CalculateSkillRaterScores
    def initialize(users_result)
      @users_result = users_result
      @scoring = {}
    end

    def call
      return {} if users_result.answers.empty?

      process_questions
      scoring
    end

    private

    attr_reader :users_result, :scoring

    def process_questions
      questions_with_deps.each do |question_id, question|
        result = users_result.answers[question_id.to_s]
        next unless question.skill_rater?

        process_question(question, result)
      end
    end

    def process_question(question, result)
      scoring_result = scorer.calculate(question, question.skill, result)
      return unless scoring_result[:value]

      factor_id = question.skill.factor.id
      scoring[factor_id] ||= { results: [] }

      scoring[factor_id][:results] << {
        question_id: question.id,
        value: scoring_result[:value],
        max_value: scoring_result[:max_value]
      }
      scoring[factor_id][:score] = scoring_result[:value]
    end

    def questions_with_deps
      @questions_with_deps ||= Question.skill_rater.
                               includes(skill: :factor).
                               where(id: users_result.answers.keys).
                               index_by(&:id)
    end

    def scorer
      @scorer ||= ::Scoring::SkillRater.new
    end
  end
end
