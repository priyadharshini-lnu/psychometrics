# frozen_string_literal: true

class CampaignsUser < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
end
