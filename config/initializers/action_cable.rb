# frozen_string_literal: true

require 'action_cable/engine'
require 'action_cable/subscription_adapter/redis'

module ActionCable
  module SubscriptionAdapter
    Redis.class_eval do
      # cattr_accessor(:redis_connector) { ->(config) { ::Redis.new(config.slice(:url, :host, :port, :db, :password, :path)) } }
    end
  end
end
