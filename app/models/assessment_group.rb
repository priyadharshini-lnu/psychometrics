# frozen_string_literal: true

class CampaignAssessmentGroup < ApplicationRecord
  has_many :campaign_assessments, dependent: :destroy
  belongs_to :campaign, dependent: :destroy
end
