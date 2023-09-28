# frozen_string_literal: true

module Assessments::SavilleSettings
  def self.norms(assessment_id)
    norms = Settings.providers.saville.assessments.find { |a| a.id.casecmp(assessment_id).zero? }
    Settings.providers.saville.norms.select { |norm| norms.norm_ids.include?(norm.id) }.map(&:to_h)
  end
end
