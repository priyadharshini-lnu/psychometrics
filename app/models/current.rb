# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :user_country
  attribute :project
  attribute :saml_service_provider
  attribute :request_id
  attribute :ip_address
  attribute :request_url
  attribute :user_agent
  attribute :application_component
end
