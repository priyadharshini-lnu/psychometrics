# frozen_string_literal: true

class CommunicationCcUser < ApplicationRecord
  audited

  belongs_to :communication
  belongs_to :user
  include Tenantable

  tenant_source :communication
end
