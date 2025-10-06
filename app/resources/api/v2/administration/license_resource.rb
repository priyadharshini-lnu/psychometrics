# frozen_string_literal: true

class Api::V2::Administration::LicenseResource < Api::V2::Administration::BaseResource
  attributes :number, :overuse_number, :used_number, :client_id, :start_date, :end_date,
             :report_family_id, :disabled, :type, :enabled, :is_project_specific

  has_one :client
  has_one :report_family

  ransack_filters %i[report_family_name_cont]

  before_create -> { @model.client_id = context[:client].id }

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, License]).where(
      client_id: opts[:context][:client].id
    )
  end

  def enabled
    !@model.disabled
  end

  def enabled=(value)
    @model.disabled = !value
  end
end
