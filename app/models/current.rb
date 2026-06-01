# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :user_country
  attribute :admin_context
  attribute :client
  attribute :memberships
  attribute :membership_roles
  attribute :project
  attribute :saml_service_provider
  attribute :request_id
  attribute :ip_address
  attribute :request_url
  attribute :user_agent
  attribute :application_component

  def self.client_admin_context?
    admin_context == :client_admin && client.present?
  end

  def self.super_admin_context?
    admin_context == :super_admin
  end

  def self.root_domain?
    super_admin_context? && client.nil?
  end
end
