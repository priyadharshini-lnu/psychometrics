# frozen_string_literal: true

class Api::V2::Administration::ProjectResource < Api::V2::Administration::BaseResource
  model_name 'Client'

  attributes :name, :number, :subdomain, :logo, :created_at, :updated_at,
             :locales, :disabled, :privacy_consent, :ancestry, :client_id,
             :url, :text, :link, :enable_privacy_link, :enable_live_chat, :live_chat_token,
             :custom_privacy_consent, :custom_privacy_consent_texts, :custom_privacy_policy_version

  has_one :privacy_link, foreign_key: :client_id
  has_one :creator, foreign_key: :created_by_id
  has_one :modifier, foreign_key: :modified_by_id

  delegate :text, :link, :text=, :link=, to: :privacy_link, allow_nil: true

  ransack_filters %i[disabled_true filterable_fields]

  before_create do
    @model.ancestry = context[:client].id
    @model.applicable_level = :campaign
    @model.created_by_id = context[:user].id
  end

  before_update do
    @model.modified_by_id = context[:user].id
  end

  after_update do
    @model.privacy_link&.destroy unless @enable_privacy_link
  end

  attr_writer :enable_privacy_link

  audit_log_for :create, payload: '*', parent_resource: ->(_, record) { { project: record } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, record) { { project: record } }
  audit_log_for :destroy, payload: ->(_, project) { project.attributes.slice('id', 'name') },
    parent_resource: ->(_, record) { { project: record } }

  def client_id
    @model.ancestry
  end

  def enable_privacy_link
    @model.privacy_link.present?
  end

  def url
    URI("#{Settings.protocol}://#{@model.subdomain}.#{Settings.domain}:#{Settings.port}").to_s
  end

  def logo
    @model.design_setting.logo&.url
  end

  def privacy_link
    return @model.privacy_link || @model.build_privacy_link if @enable_privacy_link

    @model.privacy_link
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def custom_privacy_consent_texts=(texts)
    texts.each do |text|
      @model.send(:custom_privacy_consent_text=, text[:text], locale: text[:locale])
    end
  end

  def custom_privacy_consent_texts
    (@model.locales.presence || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.custom_privacy_consent_text(locale: locale)
      }
    end
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Project]).where(
      ancestry: opts[:context][:client].id
    )
  end

  def fetchable_fields
    super - [:ancestry]
  end
end
