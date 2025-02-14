# frozen_string_literal: true

class CampaignIdp < ApplicationRecord
  belongs_to :campaign
  belongs_to :idp_template
end
