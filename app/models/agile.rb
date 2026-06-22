# frozen_string_literal: true

class Agile < ApplicationRecord
  audited

  belongs_to :assessment

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment
end
