module Actions
  module Scoring
    extend Actions::Action

    action :update do |data, _, assessment|
      id = data.delete('id')
      if id
        scoring = ::FactorsScoring.update(id, data)
      else
        scoring = assessment.factors_scoring.create!(data)
      end
      FactorsScoringSerializer.new(scoring).to_hash
    end

    action :fetch do |data, _current_administrator, assessment|
      FactorsScoring.where(assessment_id: assessment.id, factor_id: data['factor_id']).map do |scoring|
        FactorsScoringSerializer.new(scoring)
      end
    end
  end
end
