# frozen_string_literal: true

class Api::V2::Administration::RegistrationSettingResource < Api::V2::Administration::BaseResource
  attributes :require_mobile_number, :hide_signup

  has_one :project

  def self.records(opts = {})
    super.where(project_id: opts[:context][:project_id])
  end

  audit_log_for :update, payload: '*'
end
