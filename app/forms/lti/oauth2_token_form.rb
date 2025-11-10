# frozen_string_literal: true

module Lti
  class Oauth2TokenForm
    include ActiveModel::Model
    include ActiveModel::Attributes

    attribute :grant_type, :string
    attribute :client_assertion_type, :string
    attribute :client_assertion, :string
    attribute :scope, :string

    validates :grant_type, presence: true, inclusion: { in: ['client_credentials'] }
    validates :client_assertion_type, presence: true,
              inclusion: { in: ['urn:ietf:params:oauth:client-assertion-type:jwt-bearer'] }
    validates :client_assertion, presence: true
    validates :scope, presence: true

    def initialize(params = {})
      super
    end

    def client_credentials_grant?
      grant_type == 'client_credentials'
    end

    def valid_assertion_type?
      client_assertion_type == 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
    end

    def error_response
      return { error: 'unsupported_grant_type' } unless client_credentials_grant?

      unless valid_assertion_type?
        return { error: 'invalid_client',
                 error_description: 'Invalid client assertion type' }
      end
      return { error: 'invalid_request', error_description: 'Missing required parameters' } unless valid?

      nil
    end
  end
end
