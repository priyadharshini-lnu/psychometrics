# frozen_string_literal: true

class CampaignAssessorAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :campaign_assessment_group
  include Tenantable

  has_many :factors, -> { distinct }, through: :assessment

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
