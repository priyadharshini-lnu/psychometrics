module Actions
  module Scoring
    extend Actions::Action

    action :update do |data, _, assessment|
      id = data.delete('id')
      if id
        ::FactorsScoring.update(id, data)
      else
        assessment.factors_scoring.create!(data)
      end
      nil
    end
  end
end
