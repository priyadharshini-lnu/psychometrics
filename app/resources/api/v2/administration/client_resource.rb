# frozen_string_literal: true

class Api::V2::Administration::ClientResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :year, :number, :country
  has_one :project_manager

  ransack_filters %i[name_cont filterable_fields applicable_level_eq search_query]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name') }

  def meta_details
    {
      permissions: lambda {
        license_permissions.merge(client_permissions)
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
end
