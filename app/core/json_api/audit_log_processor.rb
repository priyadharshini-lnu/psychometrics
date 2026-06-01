# frozen_string_literal: true

module JsonApi
  class AuditLogProcessor < JSONAPI::Processor
    attr_reader :log_config

    set_callback :find, :after, :audit_log_find
    set_callback :show, :after, :audit_log_show
    set_callback :create_resource, :after, :audit_log_create_resource
    set_callback :replace_fields, :after, :audit_log_update_resource
    set_callback :remove_resource, :after, :audit_log_remove_resource
    set_callback :show_relationship, :after, :audit_log_show_relationship
    set_callback :show_related_resource, :after, :audit_log_show_related_resource
    set_callback :show_related_resources, :after, :audit_log_show_related_resources
    set_callback :replace_to_one_relationship, :after, :audit_log_replace_to_one_relationship
    set_callback :remove_to_one_relationship, :after, :audit_log_remove_to_one_relationship
    set_callback :create_to_many_relationships, :after, :audit_log_create_to_many_relationships
    set_callback :replace_to_many_relationships, :after, :audit_log_replace_to_many_relationships
    set_callback :remove_to_many_relationships, :after, :audit_log_remove_to_many_relationships

    def initialize(_, _, _)
      super
      set_current_record
    end

    def audit_log_find
      log_details(:index)
    end

    def audit_log_show
      log_details(:show)
    end

    def audit_log_create_resource
      log_details(:create)
    end

    def audit_log_update_resource
      log_details(:update)
    end

    def audit_log_remove_resource
      log_details(:destroy)
    end

    def audit_log_show_relationship
      log_details(:show_relationship)
    end

    def audit_log_show_related_resource
      log_details(:show_related_resource)
    end

    def audit_log_show_related_resources
      log_details(:show_related_resources)
    end

    def audit_log_replace_to_one_relationship
      log_details(:replace_to_one_relationship)
    end

    def audit_log_remove_to_one_relationship
      log_details(:remove_to_one_relationship)
    end

    def audit_log_create_to_many_relationships
      log_details(:create_to_many_relationships)
    end

    def audit_log_replace_to_many_relationships
      log_details(:replace_to_many_relationships)
    end

    def audit_log_remove_to_many_relationships
      log_details(:remove_to_many_relationships)
    end

    def config_klass
      @config_klass ||= params[:source_klass] || resource_klass
    end

    def log_details(action)
      return unless config_klass._audit_log_config

      @log_config = config_klass._audit_log_config[action]
      return unless log_config

      return if log_config[:if] && !log_config[:if].call(context, current_record)

      context = params[:context]
      AuditLogModule.audit!(
        log_config[:action_name] || action,
        current_record,
        {
          user: context[:user], payload: audit_log_payload, record_type: config_klass._model_class,
          request_details: context[:request_details],
          impersonated_by_id: context[:impersonated_by_id]
        }.merge(parent_resource_detail || {})
      )
    end

    def record_or_record_klass
      @record_or_record_klass ||= current_record || config_klass._model_class
    end

    def audit_log_payload
      context = params[:context]
      if log_config[:payload].nil?
        {}
      elsif log_config[:payload].respond_to?(:call)
        log_config[:payload].call(context, record_or_record_klass)
      elsif log_config[:payload] == '*'
        context[:params]
      elsif log_config[:payload].is_a?(Symbol)
        unless config_klass.respond_to?(log_config[:payload])
          raise NoMethodError, "#{log_config[:payload]} class method not found"
        end

        config_klass.send(log_config[:payload], context, record_or_record_klass)
      end
    end

    def set_current_record
      if params[:source_klass] && params[:source_id]
        @current_record ||= params[:source_klass].find_by_key(
          params[:source_id],
          context: context
        )._model
      elsif current_record_id
        @current_record ||= config_klass.find_by_key(
          current_record_id,
          context: context
        )._model
      end
    end

    def current_record
      return @current_record if @current_record

      result.resource._model if result.is_a?(JSONAPI::ResourceOperationResult) && result.resource
    end

    def current_record_id
      return operation_resource_id if operation_resource_id

      return params[:parent_key] if params[:parent_key]

      params[:resource_id] if params[:resource_id]
    end

    def parent_resource_detail
      return parent_resource_from_passed_args if log_config[:parent_resource]

      return parent_resource_from_request_body if parent_resource_from_request_body.present?

      return parent_resource_from_filter if parent_resource_from_filter.present?

      parent_resource_from_record
    end

    def parent_resource_from_record
      return {} unless current_record

      parent_resource_types.each_with_object({}) do |parent_type, hash|
        next unless current_record.respond_to?(parent_type)

        hash[parent_type.to_sym] = current_record.send(parent_type)
        break hash
      end
    end

    def parent_resource_from_passed_args
      if log_config[:parent_resource].respond_to?(:call)
        log_config[:parent_resource].call(context, record_or_record_klass)
      elsif resource_klass.respond_to?(log_config[:parent_resource], record_or_record_klass)
        log_config[:parent_resource].send(log_config[:parent_resource], context)
      end
    end

    def parent_resource_from_request_body
      @parent_resource_from_request_body ||= parent_resource_types.each_with_object({}) do |parent_type, hash|
        data = context[:params][:data]
        next unless data.is_a?(Hash) || data.is_a?(ActionController::Parameters)

        parent_id = data.dig(:relationships, parent_type, :data, :id)
        next unless parent_id

        hash[parent_type.to_sym] = parent_type.capitalize.safe_constantize.find(parent_id)
        break hash
      end
    end

    def parent_resource_from_filter
      @parent_resource_from_filter ||= parent_resource_types.each_with_object({}) do |parent_type, hash|
        parent_id = context[:params].dig(:filter, "#{parent_type}_id_eq")
        next unless parent_id

        hash[parent_type.to_sym] = parent_type.capitalize.safe_constantize.find(parent_id)
        break hash
      end
    end

    def operation_resource_id
      case operation_type
        when :show
          params[:id]
        when :show_related_resources
          params[:source_id]
        else
          params[:resource_id]
      end
    end

    def parent_resource_types
      %w[campaign project client]
    end
  end
end
