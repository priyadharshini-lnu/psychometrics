# frozen_string_literal: true

class Agile < ApplicationRecord
  audited

  belongs_to :assessment

  include Tenantable

  tenant_source :assessment
end
