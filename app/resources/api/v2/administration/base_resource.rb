# frozen_string_literal: true

class Api::V2::Administration::BaseResource < JSONAPI::Resource
  include JSONAPI::Authorization::PunditScopedResource
  abstract

  model_hint model: 'users/regular', resource: :user
  model_hint model: 'users/admin', resource: :user
  model_hint model: 'users/super_admin', resource: :user

  class_attribute :_audit_log_config

  def self.ransack_filters(matchers)
    matchers.each do |matcher|
      filter matcher, apply: ->(records, value, _) { records.ransack(matcher => value[0]).result }
    end
  end

  def self.audit_log_for(action, options)
    self._audit_log_config ||= {}
    self._audit_log_config[action] = options
  end
end
