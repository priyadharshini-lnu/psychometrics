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
          rows = []
          @scoring_list.each do |scoring|
            factors_scoring_attributes = scoring.slice(:factor_id, :question_id, :props).merge({ assessment_id: @assessment.id })
            rows << factors_scoring_attributes.to_h
          end
          rows.uniq! {|r| "#{r[:factor_id]}-#{r[:question_id]}-#{r[:assessment_id]}" }
          FactorsScoring.import rows, on_duplicate_key_update: {conflict_target: [:factor_id, :question_id, :assessment_id], columns: [:props]}
          FactorsScoring.where("props::text = '[]'").delete_all
        rescue => e
          Rails.logger.info(e)
          return false
        end
      end
      true
    end
  end
end
