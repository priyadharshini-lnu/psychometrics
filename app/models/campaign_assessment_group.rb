# frozen_string_literal: true

class CampaignAssessmentGroup < ApplicationRecord
  audited

  has_many :campaign_assessments, dependent: :nullify
  has_many :communications, dependent: :destroy
  has_many :workshops
  belongs_to :campaign
  include Tenantable

  before_create :set_position

  enum :group_type, { regular: 0, assessment_center: 1 }

  def log_attribute_for_delete
    slice(:name, :position, :campaign_id)
  end

  def set_position
    self.position = (campaign.campaign_assessment_groups.maximum('position') || 0) + 1 unless position
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name group_type position]
  end
end
