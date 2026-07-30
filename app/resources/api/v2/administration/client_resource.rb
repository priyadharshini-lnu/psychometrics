# frozen_string_literal: true

class Api::V2::Administration::ClientResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :year, :number, :country, :subdomain, :url, :logo
  has_one :project_manager

  ransack_filters %i[name_cont filterable_fields applicable_level_eq search_query]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name') }

  def url
    @model.admin_url
  end

  def logo
    @model.client_design_setting&.logo_url
  end

  def self.records(*args)
    super.includes(client_design_setting: { logo_attachment: :blob })
  end

  def meta_details
    {
      permissions: lambda {
        {}.merge(
          license_permissions,
          client_permissions,
          project_permissions
        )
      }
    }
  end

  private

  def license_permissions
    GetPermissionsHash.call!(
      Administration::LicensePolicy,
      context[:user],
      @model,
      [
        %w[view_licenses index]
      ],
      {
        project_id: @model.id
      }
    )
  end

  def client_permissions
    GetPermissionsHash.call!(
      Administration::ClientPolicy,
      context[:user],
      @model,
      %w[
        view_audit_reports
        view_data_reports
      ],
      {
        project_id: @model.id
      }
    )
  end

  def project_permissions
    GetPermissionsHash.call!(
      Administration::ProjectPolicy,
      context[:user],
      @model,
      [
        'can_manage_project',
        'manage_project_admins',
        'manage_project_smtp_settings',
        'manage_project_webhooks',
        %w[manage_project_general_settings update],
        'manage_project_privacy_setting',
        'manage_project_assessments',
        'view_audit_reports'
      ],
      {
        project_id: @model.id
      }
    )
  end
end
