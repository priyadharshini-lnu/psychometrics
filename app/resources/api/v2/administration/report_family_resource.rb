# frozen_string_literal: true

class Api::V2::Administration::ReportFamilyResource < Api::V2::Administration::BaseResource
  attributes :name, :created_at, :updated_at, :client_id, :tenant_name

  audit_log_for :create, payload: '*'
  ransack_filters %i[name_cont filterable_fields tenant_id_eq]

  has_one :tenant, class_name: 'Client', foreign_key: :tenant_id

  def client_id
    @model.tenant_id
  end

  def client_id=(value)
    ActsAsTenant.with_mutable_tenant { @model.tenant_id = value }
  end

  def tenant_name
    @model.tenant&.name
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::ReportFamilyPolicy,
          context[:user],
          @model,
          %w[manage],
          {}
        )
      }
    }
  end
end
