# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Api
  class V2::Administration::BaseController < ActionController::Base
    include AuditLogModule::ControllerHelper
    include SiemLogger::ControllerHelper
    include JSONAPI::Utils
    include V2::Administration::Concerns::ApiController
    include Pundit
    include AddCookie
    include SetCurrentCountry
    include GeoRestriction
    include ::Administration::Impersonation
    include ::Administration::HandoffRedirect
    include ::Administration::SessionEnforcement

    def siem_log_impersonation_event(target_user, role)
      super(target_user, current_user, role)
    end

    ACTION_TO_SCHEMA_NAME = {
      create: :create_request, update: :update_request, create_relationship:
      :create_relationship_request, update_relationship: :update_relationship_request
    }.freeze

    protect_from_forgery with: :null_session
    class_attribute :_crud_schema_class, :_request_schemas, :_cached_schema_or_contract

    skip_before_action :verify_authenticity_token
    prepend_before_action :validate_requests_schema
    prepend_before_action :set_request_related_current_attributes
    before_action :set_current_attributes
    before_action :enforce_root_domain_api_isolation
    before_action :ensure_project
    before_action :ensure_campaign
    # Setting up additional fields for custom actions in json_api response
    # 'gems/jsonapi-resources-CURRENT_GEM_VERSION/lib/jsonapi/acts_as_resource_controller.rb'
    before_action :setup_custom_request, except: %i[
      index show create update destroy
      show_relationship create_relationship update_relationship destroy_relationship
      get_related_resource get_related_resources
    ]
    append_before_action :pundit_authorize
    append_after_action :verify_authorized

    def render(*args)
      options = args.extract_options!
      if [nil, 0].include?(options[:status]) && json_api_error_response?(options)
        options[:status] = :unprocessable_content
      end
      super(*(args << options))
    end

    rescue_from JSONAPI::Exceptions::Error, with: :rescue_json_api_error
    rescue_from ActiveRecord::RecordNotFound, with: :rescue_record_not_found
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def self.validate_crud_requests(schema_class)
      self._crud_schema_class = schema_class
    end

    def self.validates_request_schema(action, schema)
      self._cached_schema_or_contract ||= {}
      self._request_schemas ||= {}
      self._request_schemas[action] = schema
    end

    def validate_requests_schema # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      schema_validation = nil
      action = params[:action].to_sym
      schema_or_contract = _request_schemas&.dig(action)
      if schema_or_contract
        schema_or_contract = if schema_or_contract.is_a?(Symbol)
                               send(schema_or_contract)
                             elsif _cached_schema_or_contract[action]
                               _cached_schema_or_contract[action]
                             else
                               _cached_schema_or_contract[action] = schema_or_contract.call
                             end
        schema_validation = if schema_or_contract.is_a?(Dry::Schema::Processor)
                              schema_or_contract.call(params.permit!.to_h)
                            else
                              schema_or_contract.call(params.permit!.to_h, context_for_schema_validation)
                            end
      end

      if schema_validation.nil? && _crud_schema_class.present?
        method_name = ACTION_TO_SCHEMA_NAME[action]
        return unless method_name

        schema_validation = if %i[create_relationship_request update_relationship_request].include?(method_name)
                              _crud_schema_class.
                                public_send(method_name, params[:relationship]).
                                call(params.permit!.to_h)
                            else
                              _crud_schema_class.public_send(method_name).call(params.permit!.to_h)
                            end
      end

      if schema_validation&.failure?
        render json: convert_dry_errors_to_json_api_standard(schema_validation.errors), status: :unprocessable_content
      end
    end

    def audit_log_for_record_not_found(error)
      query = {}
      query[error.primary_key] = error.id

      unless error.model && error.id && error.primary_key && !error.model.safe_constantize.find_by(query)
        audit! :user_not_authorized, current_user, payload: params,
        outcome: :failed, failure_reason: :user_not_authorized
      end
    end

    def json_api_records(data, type)
      {
        data: data.map do |record|
          {
            type: type,
            id: record['id'].to_s,
            attributes: record
          }
        end
      }
    end

    def json_api_attributes(record, attrs)
      {
        data: {
          type: record.class.name.underscore.pluralize,
          id: record.id.to_s,
          attributes: attrs
        }
      }
    end

    def context_for_schema_validation
      { current_user: current_user, project: project, campaign: campaign, params: params }
    end

    def rescue_json_api_error(error)
      jsonapi_render_errors error
    end

    def serialize_resources(data, resource, options = {})
      options = options.merge({
        fields: @request.fields,
        include_directives: @request.include_directives
      })
      JSONAPI::ResourceSerializer.new(resource, options).
        serialize_to_hash(data.map { |d| resource.new(d, context) })
    end

    def serialize_user(user)
      JSONAPI::ResourceSerializer.new(Api::V2::UserResource).
        serialize_to_hash(Api::V2::UserResource.new(user, nil))
    end

    def convert_dry_errors_to_json_api_standard(dry_errors)
      errors = dry_errors.map do |error|
        {
          title: error.text,
          source: {
            pointer: "/#{error.path.join('/')}"
          },
          status: '422'
        }
      end
      { errors: errors }
    end

    def user_not_authorized
      audit! :user_not_authorized, current_user, payload: params, outcome: :failed,
      failure_reason: :user_not_authorized

      siem_log_authorization_failure(
        resource: model_class_name || controller_name.classify,
        action: params[:action]
      )

      errors = [{
        title: I18n.t('errors.forbidden'),
        status: 403
      }]

      render json: { errors: errors }, status: 403
    end

    def context
      {
        user: current_user,
        namespace: %i[api administration],
        params: params,
        request_details: request_details_to_log,
        project: project,
        campaign: campaign,
        impersonated_by_id: session[:impersonated_by_id]
      }
    end

    def rescue_record_not_found(error)
      audit_log_for_record_not_found(error)
      jsonapi_render_errors JSONAPI::Exceptions::RecordNotFound.new(error.id)
    end

    def campaign_id
      params[:campaign_id] || campaign&.id
    end

    def project_id
      params[:project_id] || project&.id
    end

    def campaign
      return unless params[:campaign_id]

      scope = Api::Administration::CampaignPolicy::Scope.new(
        current_user,
        Campaign
      ).resolve

      @campaign ||= scope.find(params[:campaign_id])
    end

    def project
      return unless params[:project_id]

      @project ||= ::Administration::ClientPolicy::Scope.new(
        current_user,
        Client
      ).resolve.find(params[:project_id])
    end

    def set_current_attributes
      Current.user = @current_user
    end

    def ensure_project
      project if params[:project_id]
    end

    def ensure_campaign
      campaign if params[:campaign_id]
    end

    def setup_custom_request
      @request.parse_fields(params[:fields])
      @request.parse_include_directives(params[:include])
      @request.parse_filters(params[:filter])
      @request.parse_sort_criteria(params[:sort])
      @request.parse_pagination(params[:page])
    end

    def pundit_authorize
      per_action_authorize_method = "authorize_#{action_name}"
      return send(per_action_authorize_method) if respond_to?(per_action_authorize_method, true)

      authorize(
        model || model_class,
        nil,
        policy_class: policy_class,
        project_id: project_id || params[:client_id],
        campaign_id: campaign_id || params[:campaign_id]
      )
    end

    def model_class_name
      @model_class_name ||= self.class.name.underscore.sub(/_controller$/, '').split('/').last.singularize.camelize
    end

    def model_class
      @model_class ||= model_class_name.safe_constantize
    end

    def model_id
      @model_id ||= params[:id] || params["#{model_class.name.underscore}_id"]
    end

    def model
      return if model_class.nil? || model_id.nil?

      @model ||= policy_class::Scope.new(
        current_user, model_class, campaign_id: campaign_id || params[:campaign_id],
        project_id: project_id || params[:project_id]
      ).resolve.find(model_id)
    end

    def policy_class
      @policy_class ||= "Api::Administration::#{model_class}Policy".safe_constantize
    end

    def base_response_meta
      return {} if params[:include_meta].blank?

      meta_keys = params[:include_meta] == '*' ? meta_details.keys.map(&:to_s) : params[:include_meta].split(',')
      meta_details.each_with_object({}) do |(key, value), hash|
        hash[key] = value.call if meta_keys.include?(key.to_s)
      end
    end

    def meta_details
      {}
    end

    def limit_and_offset
      return @limit_and_offset if defined?(@limit_and_offset)

      page_size = if params.dig(:page,
                                :size).to_i.positive?
                    params.dig(:page, :size).to_i
                  else
                    JSONAPI.configuration.default_page_size
                  end
      page_number = params.dig(:page, :number).to_i.positive? ? params.dig(:page, :number).to_i : 1
      offset = (page_number - 1) * page_size
      @limit_and_offset ||= { limit: page_size, offset: offset }
    end

    def convert_model_errors_to_json_api_standard(input_errors)
      converted_errors = []
      input_errors.each do |field, messages|
        messages.each do |message|
          converted_errors << {
            'title' => message,
            'source' => {
              'pointer' => "/data/attributes/#{field}"
            },
            'status' => '422'
          }
        end
      end

      { 'errors' => converted_errors }
    end

    private

    def ignore_password_expire?
      session[:saml_login]
    end

    def set_request_related_current_attributes
      Current.request_id = request.request_id
      Current.ip_address = request.remote_ip
      Current.request_url = request.url
      Current.application_component = 'admin'
    end

    def json_api_error_response?(options)
      options[:json].is_a?(Hash) && options[:json].key?(:errors)
    end
  end
end
# rubocop:enable Metrics/ClassLength
