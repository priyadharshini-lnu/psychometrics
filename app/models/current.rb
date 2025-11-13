# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :user_country
  attribute :project
  attribute :saml_service_provider
end
