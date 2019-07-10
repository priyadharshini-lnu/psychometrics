module Builders
  class ScoringBuilder
    # Authorisation flow
    include Pundit
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      current_user
    end

    attr_accessor :current_user, :scoring_list, :assessment, :factor_scoring_map

    def initialize(assessment, scoring, current_user)
      @current_user = current_user
      @assessment = assessment
      @scoring_list = scoring.map(&:permit!)
      @factor_scoring_map = FactorsScoring.where(assessment: assessment).index_by { |fs| [fs.factor_id, fs.question_id] }
    end

    def save!
      ActiveRecord::Base.transaction do
        @scoring_list.each do |scoring|
          existing_scoring = factor_scoring_map[[scoring[:factor_id], scoring[:question_id]]]
          next if existing_scoring && existing_scoring.props == scoring[:props].map(&:to_h)
          next if scoring[:props].empty? && !existing_scoring

          factors_scoring = existing_scoring || FactorsScoring.new(
            factor_id: scoring[:factor_id],
            question_id: scoring[:question_id],
            assessment_id: assessment.id
          )
          factors_scoring.update!(props: scoring[:props])
        end
      end
    end
  end
end
