# frozen_string_literal: true

class ReportFamiliesReport < ApplicationRecord
  include OwnerCompatibility

  scope :filterable_fields, lambda { |search_term|
    joins(:report).where('reports.name ILIKE ?', "%#{search_term}%")
  }
  audited

  belongs_to :report
  belongs_to :report_family

  validate :report_and_report_bundle_owner_compatibility,
           if: :validate_report_and_report_bundle_owner_compatibility?

  before_save -> { self.external_package_id = external_package_id.presence }

  class << self
    def ransackable_scopes(_auth_object = nil)
      %i[filterable_fields]
    end
  end

  private

  def report_and_report_bundle_owner_compatibility
    return if report_family.blank? || report.blank?

    report_bundle_owner_id = report_family.tenant_id
    report_owner_id = report.owner_id
    return if compatible_owner_ids?(report_bundle_owner_id, report_owner_id)

    add_owner_compatibility_error(
      :report,
      child_resource: :report,
      parent_resource: :report_bundle
    )
  end

  def validate_report_and_report_bundle_owner_compatibility?
    new_record? || will_save_change_to_report_id? || will_save_change_to_report_family_id?
  end
end
