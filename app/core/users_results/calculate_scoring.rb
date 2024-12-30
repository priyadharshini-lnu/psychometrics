# frozen_string_literal: true

#
# 1 step:
# Generate hash: { factor_id: [FactorsScoring, FactorsScoring, ...], ...} - factors_scoring_map
#
# 2 step:
# Generate hash from questions related with FactorsScoring: {question_id: [Question],
# question_id: [Question]} - questions_map
#
# 3 step:
# Run through hash #1:
#   for every factor calculate scoring by assign->results and FactorScoring->props
#
# 4 step:
# Temporal result save to assign->scoring:
# Example: {866=>{:name=>"Rubyable", :results=>[2.0, 2.5, 3.0]}, 867=>{:name=>"Reactable", :results=>[2.0, 2.5, 3.0]}}
#
#
# 5 step:
# Calculate average of field scoring[factor_id][:results]
# Example: {866=>{:name=>"Rubyable", :results=>3.75}, 867=>{:name=>"Reactable", :results=>2.5}}
#

module UsersResults
  class CalculateScoring < BaseCommand
    def initialize(users_result, norm_data = nil)
      @users_result = users_result
      @norm_data = norm_data || users_result.norm_data
      @scoring = {}
    end

    # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    def call
      assessment = users_result.assessment
      return broadcast :ok, {} unless assessment.dimension

      factors_scoring = FactorsScoring.
                        includes(:factor, :question).
                        where(assessment_id: assessment.id, factors: { dimension_id: assessment.dimension_id })

      factors_scoring_map = factors_scoring.group_by(&:factor_id)
      questions_ids = factors_scoring.map(&:question_id).uniq
      questions_map = Question.where(id: questions_ids).all.group_by(&:id)

      factors_question_count = {}

      factors_scoring_map.each do |factor_id, scoring_array|
        scoring[factor_id] = { results: [] }
        factors_question_count[factor_id] = 0
        scoring_array.each do |question_scoring|
          question = questions_map[question_scoring.question_id].try(:first)
          scoring_class = "::Scoring::#{question.try(:type)}".safe_constantize

          result = users_result.answers[question&.id&.to_s]
          result_present = result && (result['answers'].present? || result['not_applicable'].present?)
          if scoring_class && result_present && question && !question_scoring.props.empty?
            scoring_result = scoring_class.new.calculate(question, result, question_scoring.props)
            scoring_point = scoring_result[:value]
            scoring_point ||= 0 if result['answers'].present?
            scoring[factor_id][:results] << {
              question_id: question.id,
              value: scoring_point,
              max_value: scoring_result[:max_value],
              value_sum: scoring_result[:value_sum]
            }
          end
          factors_question_count[factor_id] += 1 if scoring_class && question && !question_scoring.props.empty?
        end
      end

      broadcast :ok, ::UsersResults::Scoring::Extend.call!(
        scoring, norm_data,
        users_result.assessment.dimension, users_result.external_results, factors_question_count,
        users_result.answers
      )
    end
    # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

    private

    attr_reader :users_result, :scoring, :norm_data
  end
end
