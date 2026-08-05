# frozen_string_literal: true

module WebhookSystem
  # This is the model encompassing the actual record of a webhook subscription
  class Subscription < ApplicationRecord
    self.table_name = 'webhook_subscriptions'

    belongs_to :account if defined?(Account)

    validates :url, presence: true, url: { no_local: true }
    validates :secret, presence: true
    attr_encrypted :password, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)
    attr_encrypted :api_key, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)
    attr_encrypted :oauth_client_id, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)
    attr_encrypted :oauth_client_secret, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)

    has_many :topics, class_name: 'WebhookSystem::SubscriptionTopic', dependent: :destroy
    has_many :event_logs, class_name: 'WebhookSystem::EventLog', dependent: :delete_all
    include Tenantable

    accepts_nested_attributes_for :topics, allow_destroy: true

    scope :active, -> { where(active: true) }
    scope :for_topic, lambda { |topic|
      joins(:topics).where(WebhookSystem::SubscriptionTopic.table_name => { name: topic })
    }

    scope :interested_in_topic, ->(topic) { active.for_topic(topic) }

    # Main invocation point for dispatching events, can either be called on the class
    # or on a relation (ie a scoped down list of subs), will find applicable subs and dispatch to them
    #
    # @param [WebhookSystem::BaseEvent] event The Event Object
    def self.dispatch(event)
      interested_in_topic(event.event_name).each do |subscription|
        WebhookSystem::Job.perform_later subscription, event.as_json
      end
    end

    # Just a helper to get a nice representation of the subscription
    def url_domain
      URI.parse(url).host
    end

    # Abstraction around the topics relation, returns an array of the subscribed topic names
    def topic_names
      topics.map(&:name)
    end

    # Abstraction around the topics relation, sets the topic names, requires save to take effect
    def topic_names=(new_topics)
      new_topics.reject!(&:blank?)
      add_topics = new_topics - topic_names

      new_topics_attributes = topics.map do |topic|
        {
          id: topic.id,
          name: topic.name,
          _destroy: new_topics.exclude?(topic.name)
        }
      end

      new_topics_attributes += add_topics.map { |topic| { name: topic } }

      self.topics_attributes = new_topics_attributes
    end

    def account_info
      if defined?(Account)
        "#{account_id}:#{account.try(:name)}"
      else
        account_id.to_s
      end
    end

    # Fallback methods for auth_type enum (defined in Webhook subclass)
    def basic_auth?
      respond_to?(:auth_type) && auth_type == 'basic_auth'
    end

    def api_key_auth?
      respond_to?(:auth_type) && auth_type == 'api_key_auth'
    end

    def oauth?
      respond_to?(:auth_type) && auth_type == 'oauth'
    end
  end
end
