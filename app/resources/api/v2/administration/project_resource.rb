# frozen_string_literal: true

class Api::V2::Administration::ProjectResource < Api::V2::Administration::BaseResource
  model_name 'Client'

  attributes :name, :number, :subdomain, :logo, :created_at, :updated_at,
             :locales, :disabled, :ancestry, :client_id,
             :url, :enable_live_chat, :live_chat_token

  has_one :creator, foreign_key: :created_by_id
  has_one :modifier, foreign_key: :modified_by_id

  ransack_filters %i[disabled_true filterable_fields has_integration]

  before_create do
    @model.ancestry = context[:client].id
    @model.applicable_level = :campaign
    @model.created_by_id = context[:user].id
  end

  before_update do
    @model.modified_by_id = context[:user].id
  end

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { project: record } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { project: record } }
  audit_log_for :destroy, payload: ->(_, project) { project.attributes.slice('id', 'name') },
    parent_resource: ->(_, record) { { project: record } }

  def client_id
    @model.ancestry
  end

  def url
    URI("#{Settings.protocol}://#{@model.subdomain}.#{Settings.domain}:#{Settings.port}").to_s
  end

  def logo
    @model.design_setting.logo&.url
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Project]).where(
      ancestry: opts[:context][:client].id
    )
  end

  def fetchable_fields
    super - [:ancestry]
  end
end
