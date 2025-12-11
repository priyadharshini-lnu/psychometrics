# frozen_string_literal: true

class Api::V2::Administration::WebhookResource < Api::V2::Administration::BaseResource
  model_name 'Webhook'

  attributes :url, :description, :created_at, :updated_at, :topics, :username,
             :project_id, :auth_type, :active, :password, :api_key, :api_key_header, :include_locales,
             :rate_limit, :rate_limit_period, :oauth_grant_type, :oauth_token_url, :oauth_client_id,
             :oauth_client_secret, :oauth_scope, :assessments, :assessment_ids

  ransack_filters %i[filterable_fields active_true]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, webhook) { webhook.slice('id', 'description') }

  DEFAULT_SECRET = 'default'

  before_create :set_defaults

  def set_defaults
    @model.secret = DEFAULT_SECRET
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def remove
    @model.soft_delete!(context[:user])
  end

  def topics
    @model.topics.pluck(:name)
  end

  def topics=(new_fields)
    existing_topics = @model.topics.pluck(:name)
    topics_to_delete = existing_topics - new_fields
    new_fields.each do |topic|
      @model.topics.new(name: topic) unless existing_topics.include?(topic)
    end
    @model.topics.where(name: topics_to_delete).destroy_all
  end

  def assessments
    return [] if @model.assessment_ids.blank?

    ::Assessment.where(id: @model.assessment_ids).pluck(:id, :name).map do |id, name|
      { id: id.to_s, name: name }
    end
  end

  def fetchable_fields
    super - %i[password api_key]
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(
      opts[:context][:user], [:api, :administration, Webhook]
    ).webhooks_of(opts[:context][:project_id])
  end

  def oauth_client_id
    Utility::String.mask_secret(@model.oauth_client_id)
  end

  def oauth_client_secret
    Utility::String.mask_secret(@model.oauth_client_secret)
  end
end
