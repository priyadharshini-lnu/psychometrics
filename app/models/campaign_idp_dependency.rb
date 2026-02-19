# frozen_string_literal: true

class CampaignIdpDependency < ApplicationRecord
  belongs_to :campaign_idp
  belongs_to :dependency, polymorphic: true

  validates :dependency, presence: true
  validates :campaign_idp_id, uniqueness: { scope: %i[dependency_type dependency_id] }
end
