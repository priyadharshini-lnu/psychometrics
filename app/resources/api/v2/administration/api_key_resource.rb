# frozen_string_literal: true

class Api::V2::Administration::ApiKeyResource < Api::V2::Administration::BaseResource
  attributes :key, :token, :disabled, :created_at, :updated_at, :created_by_id, :updated_by_id, :description
  before_create :assign_key_and_token

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }

  before_create do
    @model.user_id = context[:params][:application_id]
    @model.created_by_id = context[:user].id
  end

  before_update do
    @model.updated_by_id = context[:user].id
  end

  def self.records(options = {})
    ApiKey.where(user_id: options[:context][:params][:application_id])
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def assign_key_and_token
    @model.user_id = context[:params][:application_id]
    @model.key = loop do
      possible_key = SecureRandom.uuid
      break possible_key unless ::ApiKey.exists?(key: possible_key)
    end
    @model.token = SecureRandom.hex(32)
  end
end
