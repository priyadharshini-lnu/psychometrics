# frozen_string_literal: true

class CampaignUser < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
  has_one :project, through: :campaign
  has_many :evaluation_results, through: :user
end
