# frozen_string_literal: true

class CommunicationsUser < ApplicationRecord
  audited

  belongs_to :user
  belongs_to :communication
  include Tenantable

  tenant_source :communication
end
