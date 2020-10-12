# frozen_string_literal: true

class CampaignAssessmentGroup < ApplicationRecord
  has_many :campaign_assessments, dependent: :nullify
  belongs_to :campaign

  before_create :set_position

  def set_position
    self.position = (campaign.campaign_assessment_groups.maximum('position') || 0) + 1 unless position
  end
end
