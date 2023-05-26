# frozen_string_literal: true

class Api::V2::Administration::AssessmentResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :icon_url, :type, :category, :created_at, :updated_at, :created_by,
             :modified_by, :icon_color, :description, :timing, :status, :enable_video_check, :enable_audio_check,
             :enable_network_check, :poster, :icon, :external_settings

  ransack_filters %i[filterable_fields with_resource_state category_in id_eq]
  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name', 'category', 'type') }

  has_one :dimension
  has_one :owner
  has_one :project

  before_create do
    @model.created_by_id = context[:user].id
  end

  before_update do
    @model.updated_by_id = context[:user].id
  end

  def remove
    @model.soft_delete!(context[:user])
  end

  def self.records(opts)
    super(opts).includes(:dimension, :owner)
  end

  def icon_url
    @model.icon&.url(:thumb)
  end

  def type
    Assessment::TYPES.key(@model.type)
  end

  def category
    @model.category
  end

  def external_settings
    if @model.external_settings['schedule_config']
      return @model.external_settings.merge('schedule_config' => @model.external_settings['schedule_config'].to_json)
    end

    @model.external_settings
  end

  def type=(value)
    @model.type = Assessment::TYPES[value.to_sym]
  end

  def external_settings=(value)
    @model.external_settings = Administration::Assessments::BuildExternalSettings.call!(@model, value)
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
end
