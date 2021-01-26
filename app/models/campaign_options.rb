# frozen_string_literal: true

class CampaignOptions < ApplicationRecord
  extend Mobility
  belongs_to :campaign
  has_many :translations, class_name: 'CampaignOptionTranslation'

  translates :instructions

  enum identification: { passport: 0, face: 1, face_and_passport: 2 }
end
