# frozen_string_literal: true

class CampaignAssessorAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  has_many :factors, -> { distinct }, through: :assessment

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
