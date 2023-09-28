# frozen_string_literal: true

module Assessments::PearsonSettings
  def self.norms(assessment_id, selected_norm = nil)
    assessment = PearsonAssessment.find_by(product_id: assessment_id)
    return unless assessment

    assessment.norms['items'].map do |norm|
      name = if norm['supportedLanguage']
               "(#{norm['supportedLanguage']}) #{norm['label']}"
             else
               norm['label']
             end
      hash = { id: norm['normId'], name: name }
      next hash.merge(selected: selected_norm == norm['normId']) if selected_norm

      hash
    end.sort_by { |norm| norm[:name] }
  end
end
