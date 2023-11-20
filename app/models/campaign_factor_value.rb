# frozen_string_literal: true

class CampaignFactorValue < ApplicationRecord
  belongs_to :campaign
  belongs_to :user
  belongs_to :campaign_factor
end
