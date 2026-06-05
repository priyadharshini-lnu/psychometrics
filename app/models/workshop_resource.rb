# frozen_string_literal: true

class WorkshopResource < ApplicationRecord
  audited

  belongs_to :workshop
  include Tenantable

  tenant_source :workshop

  validates :url, http_url: { presence: true }
end
