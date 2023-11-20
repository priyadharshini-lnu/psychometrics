# frozen_string_literal: true

class CampaignFactorGroup < ApplicationRecord
  belongs_to :campaign
  has_many :campaign_factors, dependent: :destroy
end
