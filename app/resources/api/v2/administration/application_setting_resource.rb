# frozen_string_literal: true

class Api::V2::Administration::ApplicationSettingResource < Api::V2::Administration::BaseResource
  attributes :ip_whitelisting_enabled

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }

  before_create do
    @model.user_id = context[:params][:application_id]
  end

  def self.records(options = {})
    ApplicationSetting.where(user_id: options[:context][:params][:application_id])
  end
end
