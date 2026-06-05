# frozen_string_literal: true

class CampaignIdpDependency < ApplicationRecord
  belongs_to :campaign_idp
  belongs_to :dependency, polymorphic: true
  include Tenantable

  tenant_source :campaign_idp

  validates :dependency, presence: true
  validates :campaign_idp_id, uniqueness: { scope: %i[dependency_type dependency_id] }
end
