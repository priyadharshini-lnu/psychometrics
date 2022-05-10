# frozen_string_literal: true

class Api::V2::Administration::BaseResource < JSONAPI::Resource
  include JSONAPI::Authorization::PunditScopedResource
  abstract

  model_hint model: 'users/regular', resource: :user
  model_hint model: 'users/admin', resource: :user
  model_hint model: 'users/super_admin', resource: :user

  def self.ransack_filters(matchers)
    matchers.each do |matcher|
      filter matcher, apply: ->(records, value, _options) {
        records.ransack(matcher => value[0]).result
      }
    end
  end
end
