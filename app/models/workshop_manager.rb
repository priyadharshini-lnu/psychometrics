# frozen_string_literal: true

class WorkshopManager < ApplicationRecord
  audited
  include WorkshopFacilitators

  belongs_to :workshop
  belongs_to :user
  include Tenantable

  tenant_source :workshop
end
