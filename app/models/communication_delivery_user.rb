# frozen_string_literal: true

class CommunicationDeliveryUser < ApplicationRecord
  include Tenantable

  tenant_source :communication_delivery

  belongs_to :communication_delivery
  belongs_to :user

  validates :user_id, uniqueness: { scope: :communication_delivery_id }
  validate :user_is_campaign_member

  private

  def user_is_campaign_member
    return if communication_delivery&.campaign_id.blank?
    return if CampaignUser.exists?(campaign_id: communication_delivery.campaign_id, user_id: user_id)

    errors.add(:user, 'is not a member of this campaign')
  end
end
