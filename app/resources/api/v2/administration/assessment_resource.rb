# frozen_string_literal: true

class Api::V2::Administration::AssessmentResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :icon_url, :type, :category, :created_at, :updated_at, :created_by,
             :modified_by, :icon_color, :description, :timing, :status, :enable_video_check, :enable_audio_check,
             :enable_network_check, :poster, :icon, :external_settings, :archived, :deleted, :extra

  ransack_filters %i[filterable_fields with_resource_state category_in id_eq category_eq]
  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name', 'category', 'type') }

  has_one :dimension
  has_one :owner
  has_one :project
  has_one :linked_assessment, class_name: 'Assessment'

  before_create do
    @model.created_by_id = context[:user].id
    @model.extra = { enable_video_check: false, enable_audio_check: false, enable_network_check: false }
  end

  before_update do
    @model.updated_by_id = context[:user].id
    category = context[:params].dig(:data, :attributes, :category)
    @model.linked_assessment_id = nil if category && category != Assessment::ASSESSOR_FORM
  end

  def remove
    return super if @model.deleted?

    unless @model.soft_delete!(context[:user])
      raise JSONAPI::Exceptions::ValidationErrors, self
    end

    :completed
  end

  def self.records(opts)
    super(opts).includes(:dimension, :owner)
  end

  def icon_url
    @model.icon&.url(:thumb)
  end

  def deleted
    @model.deleted?
  end

  def type
    Assessment::TYPES.key(@model.type)
  end

  def category
    @model.category
  end

  def external_settings
    return {} if @model.common?

    settings = @model.external_settings
    if settings['schedule_config']
      settings = settings.merge(
        'schedule_config' => settings['schedule_config'].to_json
      )
    end
    settings.merge(
      assessment_name: @model.external_assessment_name,
      norm_name: @model.external_norm_name
    )
  end

  def extra
    @model.extra
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

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::AssessmentPolicy,
          context[:user],
          @model,
          %w[manage],
          {
            project_id: Project.last.id
          }
        )
      }
    }
  end
end
