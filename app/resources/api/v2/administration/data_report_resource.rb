# frozen_string_literal: true

class Api::V2::Administration::DataReportResource < Api::V2::Administration::BaseResource
  attributes :name, :configuration, :report_type, :scope, :updated_at

  has_one :owner, class_name: 'Client'
  has_one :last_updated_by, class_name: 'User'

  ransack_filters %i[filterable_fields owner_id_eq scope_eq]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'

  def self.creatable_fields(_)
    super - %i[updated_at]
  end

  def self.updatable_fields(opts)
    creatable_fields(opts)
  end
end
