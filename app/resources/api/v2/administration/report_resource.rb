# frozen_string_literal: true

class Api::V2::Administration::ReportResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :created_at, :updated_at, :created_by, :modified_by, :archived, :deleted,
             :default_language, :disabled, :data_only, :icon_url, :icon_color, :poster, :icon,
             :external_settings, :provider, :hogan_report_packages

  ransack_filters %i[name_cont filterable_fields with_resource_state provider_in assessments_id_in]
  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :remove, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name', 'description') }

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
    super(opts).includes(:assessments, :owner)
  end

  def icon_url
    @model.icon_url(:thumb)
  end

  def deleted
    @model.deleted?
  end

  def external_settings
    @model.external_settings
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
    @model.poster&.url
  end

  def icon
    @model.icon&.url
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::ReportPolicy,
          context[:user],
          @model,
          %w[manage],
          {
          }
        )
      }
    }
  end

  private

  def external_report_id
    @external_report_id ||= @model.external_report_id
  end
end
