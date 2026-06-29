# frozen_string_literal: true

class Api::V2::Administration::ApplicationIpWhitelistEntryResource < Api::V2::Administration::BaseResource
  attributes :ip_or_cidr, :description, :enabled, :ip_whitelisting_enabled, :created_at, :updated_at

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }

  before_create do
    application = Users::Application.find(context[:params][:application_id])
    @model.application_setting_id = application.application_setting&.id || application.create_application_setting!.id
  end

  def self.records(options = {})
    application = Users::Application.find(options[:context][:params][:application_id])
    application_setting = application.application_setting
    raise ActiveRecord::RecordNotFound unless application_setting

    ApplicationIpWhitelistEntry.where(application_setting_id: application_setting.id)
  end

  def ip_whitelisting_enabled
    ApplicationSetting.where(id: @model.application_setting_id).pick(:ip_whitelisting_enabled) || false
  end

  def created_at
    I18n.l(@model.created_at, format: :short)
  end

  def updated_at
    I18n.l(@model.updated_at, format: :short)
  end
end
