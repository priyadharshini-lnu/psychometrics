# frozen_string_literal: true

class PearsonAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :pearson_assessment_id, presence: true

  def self.pearson_norms(pearson_assessment_id, selected_norm = nil)
    assessment = pearson_assessment(pearson_assessment_id)
    return [] unless assessment

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

  def self.pearson_assessment(pearson_assessment_id)
    PearsonAssessment.find_by(product_id: pearson_assessment_id)
  end

  def self.pearson_assessment_language(pearson_assessment_id, pearson_norm_id)
    pearson_assessment = pearson_assessment(pearson_assessment_id)
    return unless pearson_assessment

    pearson_assessment.norms['items'].find { |n| n['normId'] == pearson_norm_id }['supportedLanguage']
  end

  def pearson_norms
    self.class.pearson_norms(pearson_assessment_id)
  end

  def pearson_assessment_language
    self.class.pearson_assessment_language(pearson_assessment_id, pearson_norm_id)
  end

  private

  def pearson_assessment
    self.class.pearson_assessment(pearson_assessment_id)
  end
end
