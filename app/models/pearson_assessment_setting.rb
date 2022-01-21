# frozen_string_literal: true

class PearsonAssessmentSetting < ApplicationRecord
  belongs_to :assessment

  validates :pearson_assessment_id, presence: true

  def self.pearson_norms(pearson_assessment_id, selected_norm = nil)
    assessments = Pearson::GetAssessments.call!
    assessment = assessments.find { |a| a['productId'] == pearson_assessment_id }
    assessment.dig('norms', 'items').map do |norm|
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

  def pearson_norms
    self.class.pearson_norms(pearson_assessment_id)
  end

  def pearson_assessment_language
    assessment_setting.dig('norms', 'items').find { |n| n['normId'] == pearson_norm_id }['supportedLanguage']
  end

  private

  def assessment_setting
    Pearson::GetAssessments.call!.find { |a| a['productId'] == pearson_assessment_id }
  end
end
