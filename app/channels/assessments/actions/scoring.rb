# frozen_string_literal: true

module Assessments
  module Actions
    module Scoring
      extend Actions::Action
      action :fetch do |data, _current_user, assessment|
        FactorsScoring.where(assessment_id: assessment.id, factor_id: data['factor_id']).map do |scoring|
          FactorsScoringSerializer.new(scoring)
        end
      end
    end
  end
end
