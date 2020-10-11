# frozen_string_literal: true

class CampaignOptions < ApplicationRecord
  belongs_to :campaign

  enum identification: { passport: 0, face: 1, face_and_passport: 2 }
end
