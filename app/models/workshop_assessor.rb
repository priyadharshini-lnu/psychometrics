# frozen_string_literal: true

class WorkshopAssessor < ApplicationRecord
  audited
  include WorkshopFacilitators

  belongs_to :workshop
  belongs_to :user

  include Tenantable

  tenant_source :workshop

  after_create :ensure_client_assessor_membership
  after_create -> { Assessor.find_or_create_by!(campaign_id: workshop.campaign_id, user_id: user.id) }

  private

  def ensure_client_assessor_membership
    Membership.find_or_create_by!(
      user_id: user_id,
      client: workshop.campaign.project.client,
      role: Membership::CLIENT_ASSESSOR_ROLE,
      campaign_id: nil
    )
  end
end
