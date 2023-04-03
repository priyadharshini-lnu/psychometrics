# frozen_string_literal: true

module Assessments::SavilleSettings
  def self.norms(assessment_id, norm_id)
    norms = Settings.providers.saville.assessments.find { |a| a.id.casecmp(assessment_id).zero? }
    Settings.providers.saville.norms.select { norms.norm_ids.include?(norm_id) }.map(&:to_h)
  end
end
