# frozen_string_literal: true

class Api::V2::Administration::PublicKeyResource < Api::V2::Administration::BaseResource
  model_name 'ApplicationPublicKey'

  attributes :key_id, :public_key, :description, :disabled,
             :created_at, :updated_at, :created_by, :issuer, :audience

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { client: record.tenant } }

  before_create do
    @model.user_id = context[:params][:application_id]
    @model.created_by_id = context[:user].id
  end

  def key_id
    @model.key_id.to_s
  end

  def self.records(options = {})
    ApplicationPublicKey.where(user_id: options[:context][:params][:application_id]).includes(:creator)
  end

  def created_by
    @model.creator&.decorate&.display_name
  end

  def created_at
    I18n.l(@model.created_at, format: :short)
  end

  def updated_at
    I18n.l(@model.updated_at, format: :short)
  end

  def issuer
    @model.user_id.to_s
  end

  def audience
    ::Jwt::BuildAudience.call!(application: @model.application)
  end
end
