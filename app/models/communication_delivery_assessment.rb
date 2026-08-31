# frozen_string_literal: true

class CommunicationDeliveryAssessment < ApplicationRecord
  include Tenantable

  tenant_source :communication_delivery

  belongs_to :communication_delivery
  belongs_to :assessment

  validates :assessment_id, uniqueness: { scope: :communication_delivery_id }
  validate :assessment_belongs_to_campaign

  private

  def assessment_belongs_to_campaign
    return if communication_delivery&.campaign_id.blank?
    return if CampaignAssessment.exists?(
      campaign_id: communication_delivery.campaign_id, assessment_id: assessment_id
    )

    errors.add(:assessment, 'is not part of this campaign')
  end
end
