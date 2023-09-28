# frozen_string_literal: true

class CampaignAssessorAssessment < ApplicationRecord
  belongs_to :campaign
  belongs_to :assessment
end
