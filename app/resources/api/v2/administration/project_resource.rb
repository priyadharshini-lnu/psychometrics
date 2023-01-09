# frozen_string_literal: true

class Api::V2::Administration::ProjectResource < Api::V2::Administration::BaseResource
  model_name 'Client'

  attributes :name, :number, :subdomain, :logo, :created_at, :updated_at,
             :locales, :disabled, :privacy_consent, :ancestry

  has_one :privacy_link, foreign_key: :client_id

  delegate :text, :link, :text=, :link=, to: :privacy_link, allow_nil: true

  ransack_filters %i[disabled_true filterable_fields]

  before_create :set_ancestry

  def set_ancestry
    @model.ancestry = context[:client].id
  end

  def logo
    @model.logo&.url
  end

  def privacy_link
    @model.privacy_link || @model.build_privacy_link
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Project]).projects_of(
      opts[:context][:client].id
    )
  end

  def fetchable_fields
    super - [:ancestry]
  end
end
