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
  validate :owner_compatibility_with_reports, if: :validate_owner_compatibility_with_reports?
  validate :owner_compatibility_with_licenses, if: :validate_owner_compatibility_with_licenses?

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

  def validate_owner_compatibility_with_reports?
    return false if skip_owner_validation

    will_save_change_to_tenant_id?
  end

  def owner_compatibility_with_reports
    report_relations = ReportFamiliesReport.includes(:report).where(report_family_id: id)
    return if report_relations.blank?

    incompatible_reports = report_relations.reject do |report_families_report|
      report = report_families_report.report
      report.blank? || compatible_owner_ids?(tenant_id, report.tenant_id)
    end
    return if incompatible_reports.blank?

    add_owner_compatibility_error(
      :tenant_id,
      child_resource: :report,
      parent_resource: :report_bundle
    )
  end

  def validate_owner_compatibility_with_licenses?
    return false unless persisted?
    return false unless will_save_change_to_tenant_id?
    return false if tenant_id.nil?

    licenses.exists?
  end

  def owner_compatibility_with_licenses
    incompatible_licenses = licenses.reject { |license| license.client_id == tenant_id }
    return if incompatible_licenses.blank?

    add_owner_compatibility_error(
      :tenant_id,
      child_resource: :client,
      parent_resource: :report_bundle
    )
  end
end
