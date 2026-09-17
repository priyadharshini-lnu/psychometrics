# frozen_string_literal: true

class CommunicationDeliveryCcUser < ApplicationRecord
  include Tenantable

  tenant_source :communication_delivery

  belongs_to :communication_delivery
  belongs_to :user

  validates :user_id, uniqueness: { scope: :communication_delivery_id }
end
