# frozen_string_literal: true

class FactorsAlias < ApplicationRecord
  audited

  belongs_to :factor
  belongs_to :report

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :report, :factor
  validates :name, presence: true

  before_validation :set_default_name, on: :create

  private

  def set_default_name
    self.name ||= factor.name
  end
end
