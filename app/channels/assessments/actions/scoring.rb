# frozen_string_literal: true

module Assessments
  module Actions
    module Scoring
      extend Actions::Action

      action :fetch do |data, _current_user, assessment|
        factors = FactorsScoring.where(assessment_id: assessment.id, factor_id: data['factor_id'])
        Panko::ArraySerializer.new(
          factors,
          each_serializer: FactorsScoringSerializer
        ).to_a
      end
    end
  end
end
