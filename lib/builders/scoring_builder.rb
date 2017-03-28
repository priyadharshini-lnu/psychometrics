module Builders
  class ScoringBuilder
    # Authorisation flow
    include Pundit
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      current_user
    end

    attr_accessor :current_user, :scoring_list, :assessment

    def initialize(assessment, scoring, current_user)
      @current_user = current_user
      @assessment = assessment
      @scoring_list = scoring.map(&:permit!)
    end

    def save
      ActiveRecord::Base.transaction do
        begin
          @scoring_list.each do |scoring|
            factors_scoring_attributes = scoring.slice(:factor_id, :question_id, :props).merge({ assessment_id: @assessment.id })
            factors_scoring = FactorsScoring.find_or_initialize_by(id: scoring[:id])
            factors_scoring.update(factors_scoring_attributes)
          end
        rescue => e
          Rails.logger.info(e)
          return false
        end
      end
      true
    end
  end
end
