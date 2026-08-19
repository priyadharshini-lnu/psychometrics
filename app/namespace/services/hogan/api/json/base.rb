# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class Base < BaseCommand
          private_attr_reader :context

          TOKEN_ENDPOINT = 'Token'
          API_BASE = Settings.secrets.hogan[:json_api_url].freeze

          def initialize(args)
            @context = OpenStruct.new(args) # rubocop:disable Style/OpenStructUse
          end

          def client_with_auth(provider)
            @client_with_auth ||= Faraday.new(API_BASE) do |connection|
              connection.request :url_encoded
              connection.adapter Faraday.default_adapter

              connection.headers['Accept'] = 'application/json'
              connection.headers['Content-Type'] = 'application/json'
              connection.headers['Authorization'] = "Bearer #{token(provider)}"
            end
          end

          def client_without_auth
            @client_without_auth ||= Faraday.new(API_BASE) do |connection|
              connection.request :url_encoded
              connection.adapter Faraday.default_adapter

              connection.headers['Accept'] = 'application/json'
              connection.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            end
          end

          alias client client_with_auth

          def get_client_id(provider)
            provider ||= Settings.secrets.hogan[:default_provider]
            Settings.secrets.hogan[:credentials][provider.to_sym][:client_id]
          end

          def get_client_user_id(provider)
            provider ||= Settings.secrets.hogan[:default_provider]
            Settings.secrets.hogan[:credentials][provider.to_sym][:client_user_id]
          end

          def get_client_password(provider)
            provider ||= Settings.secrets.hogan[:default_provider]
            Settings.secrets.hogan[:credentials][provider.to_sym][:client_password]
          end

          def get_master_client_id(provider)
            provider ||= Settings.secrets.hogan[:default_provider]
            Settings.secrets.hogan[:credentials][provider.to_sym][:master_client_id]
          end

          def fetch_access_token(provider)
            response = post(
              endpoint: TOKEN_ENDPOINT,
              request: {
                grant_type: 'password',
                username: get_client_user_id(provider),
                password: get_client_password(provider),
                clientid: get_master_client_id(provider)
              },
              provider: provider
            )
            response[:body]['access_token']
          end

          def token(provider)
            @token ||= Rails.cache.fetch("hogan/token/#{provider}", expires_in: 50.minutes) do
              fetch_access_token(provider)
            end
          end

          def success_response?(response)
            response[:status] == 200 && response[:body]['messageType'] == 'Information'
          end

          private

          def get(endpoint:, provider:, request: {})
            response = client_with_auth(provider).get(Addressable::URI.encode(endpoint), request)
            { body: ::JSON.parse(response.body), status: response.status }
          rescue JSON::ParserError => e
            Sentry.capture_exception(e, extra: {
              hogan_endpoint: endpoint,
              hogan_provider: provider,
              hogan_request: request,
              response_status: response&.status,
              response_content_type: response&.headers&.[]('content-type'),
              response_body: response&.body.to_s.first(2000)
            })
            raise
          end

          def post(endpoint:, provider:, request: {})
            client = endpoint == TOKEN_ENDPOINT ? client_without_auth : client_with_auth(provider)
            request = ::JSON.generate(request) if client.headers['Content-Type'] == 'application/json'
            response = client.post(Addressable::URI.encode(endpoint), request)
            { body: ::JSON.parse(response.body), status: response.status }
          end
        end
      end
    end
  end
end
