# frozen_string_literal: true

module Api
  class V2::Administration::BaseController < ActionController::Base
    include JSONAPI::Utils

    protect_from_forgery with: :null_session
    class_attribute :_crud_schema_class, :_request_schemas

    skip_before_action :verify_authenticity_token
    prepend_before_action :validate_requests_schema
    prepend_before_action :authenticate, unless: -> { try(:skip_authentication?) }

    rescue_from ActiveRecord::RecordNotFound, with: :jsonapi_render_not_found
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
    rescue_from JSONAPI::Exceptions::Error, with: :rescue_json_api_error

    def self.validate_crud_requests(schema_class)
      self._crud_schema_class = schema_class
    end

    def self.validates_request_schema(action, schema)
      self._request_schemas ||= {}
      self._request_schemas[action] = schema
    end

    def validate_requests_schema
      schema_validation = nil
      action = params[:action].to_sym
      if _request_schemas&.dig(action)
        schema_or_contract = _request_schemas&.dig(action)
        if schema_or_contract.is_a?(Dry::Schema::Processor)
          schema_validation = schema_or_contract.call(params.permit!.to_h)
        else
          schema_validation = schema_or_contract.call(params.permit!.to_h, context_for_schema_validation)
        end
      end

      if schema_validation.nil? && _crud_schema_class.present?
        method_name = {
          create: :create_request, update: :update_request, create_relationship:
          :create_relationship_request, update_relationship: :update_relationship_request
          }[action]
        return unless method_name

        schema_validation = _crud_schema_class.public_send(method_name).call(params.permit!.to_h)
      end

      if schema_validation&.failure?
        render json: convert_dry_errors_to_json_api_standard(schema_validation.errors), status: :unprocessable_entity
      end
    end

    def context_for_schema_validation
      { current_user: current_user }
    end

    def rescue_json_api_error(error)
      jsonapi_render_errors error
    end

    def authenticate
      if ::ActionController::HttpAuthentication::Basic.has_basic_credentials?(request)
        @api_key      = fetch_api_key
        @current_user = @api_key&.user
        raise Errors::Api::AuthError unless @api_key
        raise Errors::Api::AuthError, 'API User is disabled' if @current_user&.disabled
      else
        authenticate_user!
      end
    end

    def serialize_user(user)
      JSONAPI::ResourceSerializer.new(Api::V2::UserResource).
        serialize_to_hash(Api::V2::UserResource.new(user, nil))
    end

    def fetch_api_key
      authenticate_with_http_basic do |key, token|
        possible_api_key = ApiKey.active.find_by(key: key)
        return nil if possible_api_key.nil? || possible_api_key.token != token

        possible_api_key
      end
    end

    def self.define_schema
    end

    def convert_dry_errors_to_json_api_standard(dry_errors)
      errors = dry_errors.map do |error|
        {
          title: error.text,
          source: {
            pointer: error.path.join('/')
          },
          status: '422'
        }
      end
      { errors: errors }
    end

    def context
      { user: current_user, namespace: [:api, :administration] }
    end

    def user_not_authorized
      head :forbidden
    end
  end
end
