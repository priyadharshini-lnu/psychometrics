# frozen_string_literal: true

class ReportFamily < ApplicationRecord
  include RansackSearchableFields
  include OwnerCompatibility

  audited

  attr_accessor :skip_owner_validation

  has_many :report_families_reports
  has_many :reports, through: :report_families_reports, source: :report
  has_many :assessments, through: :reports, source: :assessment
  has_many :licenses, dependent: :restrict_with_error
  has_many :license_usages, through: :licenses
  has_many :clients, through: :licenses, source: :client

  validates :name, presence: true

  scope :owned_by_client_or_tte, lambda { |client_id|
    where('tenant_id IS NULL OR tenant_id = ?', client_id)
  }
  tenant_config has_global_records: true, optional: true
  include Tenantable

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name tenant_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[tenant]
  end

  private

  def should_resolve_tenant?
    false
  end
end
