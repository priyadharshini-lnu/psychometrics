#
# 1 step:
# Generate hash: { factor_id: [FactorsScoring, FactorsScoring, ...], ...} - factors_scoring_map
#
# 2 step:
# Generate hash from questions related with FactorsScoring: {question_id: [Question], question_id: [Question]} - questions_map
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
    def initialize(users_result)
      @users_result = users_result
      @scoring = {}
    end

    def call
      return broadcast(:ok, {}) unless users_result.completed?

      factors_scoring = FactorsScoring.where(assessment_id: users_result.assessment_id).joins(:factor).all
      factors_scoring_map = factors_scoring.group_by(&:factor_id)
      questions_ids = factors_scoring.map(&:question_id).uniq
      questions_map = Question.where(id: questions_ids).all.group_by(&:id)

      factors_scoring_map.each do |factor_id, scoring_array|
        scoring[factor_id] = { results: [] }
        scoring_array.each do |question_scoring|
          question = questions_map[question_scoring.question_id].try(:first)
          scoring_class = "::Scoring::#{question.try(:type)}"
          result = users_result.answers[question.try(:id).try(:to_s)]
          if result && question && !question_scoring.props.empty?
            scoring_point = scoring_class.constantize.new.calculate(question, result, question_scoring.props)[:value]
            scoring[factor_id][:results] << { question_id: question.id, value: scoring_point } if scoring_point
          end
        end
      end

      broadcast :ok, scoring
    end

    private

    attr_reader :users_result, :scoring
  end
end
