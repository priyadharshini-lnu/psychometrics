# frozen_string_literal: true

class Api::V2::Administration::BaseResource < JSONAPI::Resource
  abstract

  model_hint model: 'users/regular', resource: :user
  model_hint model: 'users/admin', resource: :user
  model_hint model: 'users/super_admin', resource: :user
  model_hint model: 'users/application', resource: :application
  model_hint model: 'assessments/common', resource: :assessment
  model_hint model: 'assessments/hogan', resource: :assessment
  model_hint model: 'assessments/pearson', resource: :assessment
  model_hint model: 'assessments/saville', resource: :assessment
  model_hint model: 'assessments/iiht', resource: :assessment
  model_hint model: 'assessments/mettl', resource: :assessment
  model_hint model: 'assessments/simulation', resource: :assessment
  model_hint model: 'assessments/skillvue', resource: :assessment
  model_hint model: 'assessments/yoodli', resource: :assessment
  model_hint model: 'assessments/mhs', resource: :assessment
  model_hint model: 'assessments/microsite', resource: :assessment

  class_attribute :_audit_log_config

  attribute :tenant_id

  def self.ransack_filters(matchers)
    matchers.each do |matcher|
      filter matcher, apply: lambda { |records, value, _|
        filter_value = matcher.ends_with?('_in') || matcher.ends_with?('not_in') ? value : value[0]
        records.ransack(matcher => filter_value).result
      }
    end
  end

  def self.audit_log_for(action, options)
    self._audit_log_config ||= {}
    self._audit_log_config[action] = options
  end

  def self.records(opts = {})
    result = ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, _model_class])
    return result unless Current.client_admin_context? && Current.client

    AdminAuth::ClientScopeFilter.apply(result, Current.client)
  end

  def self.add_tag_filter
    filter :tagged_with, apply: lambda { |records, tags, _options|
      records.tagged_with(tags)
    }
  end

  def meta(_options)
    return {} if context[:params][:include_resource_meta].blank?

    meta_keys = if context[:params][:include_resource_meta] == '*'
                  meta_details.keys.map(&:to_s)
                else
                  context[:params][:include_resource_meta].split(',')
                end

    meta_details.each_with_object({}) do |(key, value), hash|
      hash[key] = value.call if meta_keys.include?(key.to_s)
    end
  end

  def meta_details
    {}
  end

  def tenant_id
    @model[:tenant_id]
  rescue ActiveModel::MissingAttributeError
    nil
  end

  def fetchable_fields
    fields = super
    return fields - [:tenant_id] unless @model.class.column_names.include?('tenant_id')

    fields
  end
end
