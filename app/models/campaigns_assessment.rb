# frozen_string_literal: true

class CampaignsAssessment < ApplicationRecord
  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm
end
