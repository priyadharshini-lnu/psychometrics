# frozen_string_literal: true

class Api::V2::Administration::ReportResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :created_at, :updated_at, :created_by, :modified_by, :archived, :deleted,
             :default_language, :disabled, :data_only, :icon_url, :icon_color, :poster, :icon,
             :external_settings, :external_report, :provider, :hogan_report_packages, :other_languages,
             :tag_list

  ransack_filters %i[name_cont filterable_fields with_resource_state provider_in assessments_id_in category_eq
                     with_campaign]
  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :remove, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name', 'description') }

  add_tag_filter
  filter :tenant_id, apply: lambda { |records, value, _options|
    tenant_id = value.is_a?(Array) ? value[0] : value
    records.owned_by_client_or_tte(tenant_id)
  }

  has_one :owner
  has_many :assessments

  before_create do
    @model.created_by_id = context[:user].id
    @model.extra = { icon_color: Settings.default_colors.first }
  end

  before_update do
    @model.updated_by_id = context[:user].id
  end

  def remove
    return super if @model.deleted?

    unless @model.soft_delete!(context[:user])
      raise JSONAPI::Exceptions::ValidationErrors, self
    end

    :completed
  end

  def self.records(opts)
    super.with_attached_icon.with_attached_poster.includes(:assessments, :owner, taggings: :tag)
  end

  def icon_url
    @model.icon_url(:thumb)
  end

  def deleted
    @model.deleted?
  end

  delegate :external_settings, to: :@model

  def external_report
    @model.external_report?
  end

  def hogan_report_packages
    return [] unless @model.hogan?

    Settings.providers.hogan.report_packages.
      select { |package| package.report_ids.include?(external_report_id) }.
      map { |package| { id: package.id, name: package.name } }
  end

  def external_settings=(value)
    provider = context.dig(:params, :data, :attributes, :provider)
    @model.external_settings = Administration::Reports::BuildExternalSettings.call!(@model, value, provider)
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def created_by
    @model.created_by&.decorate&.display_name
  end

  def modified_by
    @model.updated_by&.decorate&.display_name
  end

  def poster
    @model.poster_url
  end

  def icon
    @model.icon_url
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::ReportPolicy,
          context[:user],
          @model,
          %w[manage],
          {}
        )
      }
    }
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end

  private

  def external_report_id
    @external_report_id ||= @model.external_report_id
  end
end
