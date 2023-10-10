# frozen_string_literal: true

class CampaignAssessorAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
end
