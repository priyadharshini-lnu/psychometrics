# frozen_string_literal: true

class FactorsSubFactor < ApplicationRecord
  audited

  belongs_to :sub_factor, class_name: 'Factor'
  belongs_to :factor

  include Tenantable

  tenant_source :factor

  after_commit :sync_parent_child_factor_type

  private

  def sync_parent_child_factor_type
    return if factor.destroyed?

    child_type = factor.sub_factors.pick(:factor_type)
    factor.update_column(:child_factor_type, child_type)
  end
end
