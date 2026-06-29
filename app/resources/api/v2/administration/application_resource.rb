# frozen_string_literal: true

class Api::V2::Administration::ApplicationResource < Api::V2::Administration::BaseResource
  model_name 'Users::Application'

  attributes :name, :disabled, :email, :created_at, :updated_at, :created_by, :updated_by, :client_name,
             :has_api_keys, :has_public_keys

  ransack_filters %i[filterable_fields disabled_in]

  audit_log_for :create, payload: '*',  parent_resource: ->(_, record) { { client: record.tenant } }
  audit_log_for :update, payload: '*',  parent_resource: ->(_, record) { { client: record.tenant } }

  before_create do
    @model.tenant_id = context[:params].dig('query', 'tenant_id')
    @model.created_by_id = context[:user].id
  end

  after_create do
    project_id = context[:params].dig('query', 'project_id')
    if project_id.present?
      Membership.create!(
        user_id: @model.id,
        client_id: project_id.to_i,
        role: Membership::PROJECT_ADMIN_ROLE
      )
    else
      Membership.create!(
        user_id: @model.id,
        client_id: @model.tenant_id,
        role: Membership::CLIENT_ADMIN_ROLE
      )
    end
  end

  before_update do
    @model.modified_by_id = context[:user].id
  end

  def self.apply_sort(records, order_options, context)
    order_options = order_options.transform_keys { |key| key == 'name' ? 'first_name' : key }
    super
  end

  def self.records(opts = {})
    tenant_id = opts[:context][:params].dig('query', 'tenant_id')
    project_id = opts[:context][:params].dig('query', 'project_id')
    scope = Api::Administration::ApplicationPolicy::Scope.
            new(opts[:context][:user], Users::Application).
            resolve.
            includes(:creator, :modifier, :tenant, :api_keys, :public_keys)

    if project_id.present?
      scope.joins(:memberships).where(
        memberships: { client_id: project_id, role: Membership::PROJECT_ADMIN_ROLE }
      )
    elsif tenant_id.present?
      scope.joins(:memberships).where(
        memberships: { client_id: tenant_id, role: Membership::CLIENT_ADMIN_ROLE }
      )
    else
      scope
    end
  end

  def name
    @model.first_name
  end

  def name=(value)
    @model.first_name = value
  end

  delegate :email, to: :@model

  def updated_by
    @model.modifier&.decorate&.display_name
  end

  def client_name
    @model.tenant&.name
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

  # rubocop:disable Naming/PredicatePrefix
  def has_api_keys
    @model.api_keys.any?
  end

  def has_public_keys
    @model.public_keys.any?
  end
  # rubocop:enable Naming/PredicatePrefix
end
