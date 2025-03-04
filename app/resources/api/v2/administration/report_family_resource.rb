# frozen_string_literal: true

class Api::V2::Administration::ReportFamilyResource < Api::V2::Administration::BaseResource
  attributes :name, :created_at, :updated_at

  audit_log_for :create, payload: '*'
  ransack_filters %i[name_cont filterable_fields]

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
