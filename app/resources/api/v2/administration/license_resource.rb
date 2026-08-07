# frozen_string_literal: true

class Api::V2::Administration::LicenseResource < Api::V2::Administration::BaseResource
  attributes :number, :overuse_number, :used_number, :client_id, :start_date, :end_date,
             :report_family_id, :disabled, :type, :enabled, :is_project_specific, :project_license_details

  has_one :client
  has_one :report_family

  ransack_filters %i[report_family_name_cont is_project_specific_eq for_project
                     report_name_or_type_cont type_in]

  before_create -> { @model.client_id = context[:client].id }

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, License]).where(
      client_id: opts[:context][:client].id
    ).includes(:project_licenses)
  end

  def enabled
    !@model.disabled
  end

  def enabled=(value)
    @model.disabled = !value
  end

  def project_license_details
    return unless context[:project]

    project_license = @model.project_licenses.find { |pl| pl.project_id == context[:project].id }
    return unless project_license

    {
      id: project_license.id,
      usage_limit: project_license.usage_limit,
      used_number: project_license.used_number,
      enabled: project_license.enabled
    }
  end
end
