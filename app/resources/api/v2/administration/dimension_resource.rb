# frozen_string_literal: true

class Api::V2::Administration::DimensionResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :created_at, :updated_at, :occupations_enabled, :innovation_styles_enabled,
             :default_occupation_condition_set_id

  has_one :owner
  ransack_filters %i[filterable_fields]

  def self.creatable_fields(context)
    fields = super
    fields -= [:default_occupation_condition_set_id] unless context[:user]&.is?(:superadmin)
    fields
  end

  def self.updatable_fields(context)
    creatable_fields(context)
  end

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.slice(:id, :name) }

  def self.records(opts = {})
    super.includes(owner: { client_design_setting: { logo_attachment: :blob } })
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::DimensionPolicy,
          context[:user],
          @model,
          %w[copy export_json] + [%w[can_import validate_import]],
          {
            project_id: @model.owner_id
          }
        )
      }
    }
  end
end
