# frozen_string_literal: true

class DatasheetColumnPreference < ApplicationRecord
  audited

  belongs_to :resource, polymorphic: true

  include Tenantable

  tenant_source :resource
end
