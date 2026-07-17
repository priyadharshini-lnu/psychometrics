# frozen_string_literal: true

class Api::V2::Administration::AssessmentResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :icon_url, :type, :category, :created_at, :updated_at, :created_by,
             :modified_by, :icon_color, :description, :timing, :status, :enable_video_check, :enable_audio_check,
             :enable_network_check, :poster, :icon, :external_settings, :archived, :deleted, :extra, :default_language,
             :tag_list, :translations_migrated

  ransack_filters %i[filterable_fields with_resource_state category_in category_not_in id_eq category_eq archived_eq
                     project_id_eq owned_by_client_or_tte owner_id_eq name_cont with_ai_questions]

  add_tag_filter

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, client) { client.attributes.slice('id', 'name', 'category', 'type') }

  has_one :dimension
  has_one :owner
  has_one :project
  has_one :linked_assessment, class_name: 'Assessment'
  has_many :questions

  before_create do
    @model.created_by_id = context[:user].id
    @model.extra = { enable_video_check: false, enable_audio_check: false, enable_network_check: false }
  end

  after_create do
    ensure_default_locale_translations
  end

  before_update do
    @model.updated_by_id = context[:user].id
    category = context[:params].dig(:data, :attributes, :category)
    @model.linked_assessment_id = nil if category && category != Assessment::ASSESSOR_FORM
  end

  after_update do
    if @model.saved_change_to_translations_migrated? && @model.translations_migrated
      AdminJob.call(:migrate_assessment_translations, { assessment_id: @model.id }, context[:user])
    end
  end

  def remove
    return super if @model.deleted?

    unless @model.soft_delete!(context[:user])
      raise JSONAPI::Exceptions::ValidationErrors, self
    end

    :completed
  end

  def self.records(opts)
    super.with_attached_icon.with_attached_poster.
      includes(
        :translations, :created_by, :updated_by, :dimension,
        owner: { client_design_setting: { logo_attachment: :blob } }
      )
  end

  def icon_url
    @model.icon_url(:thumb)
  end

  def deleted
    @model.deleted?
  end

  def type
    Assessment::TYPES.key(@model.type)
  end

  delegate :category, to: :@model

  def external_settings
    return {} if @model.common?

    settings = @model.external_settings
    if settings['schedule_config']
      settings = settings.merge(
        'schedule_config' => settings['schedule_config'].to_json
      )
    end
    if settings['question_mappings']
      settings = settings.merge(
        'question_mappings' => settings['question_mappings'].to_json
      )
    end
    settings.merge(
      assessment_id: @model.external_assessment_id.to_s,
      assessment_name: @model.external_assessment_name,
      norm_name: @model.external_norm_name
    )
  end

  delegate :extra, to: :@model

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
    @model.poster_url
  end

  def icon
    @model.icon_url
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::AssessmentPolicy,
          context[:user],
          @model,
          %w[manage
             export_raw_results
             export_raw_factor_scores export_normed_results
             external_scores],
          {
            project_id: Project.last.id
          }
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

  def name
    @model.name || @model.read_attribute(:name)
  end

  private

  def ensure_default_locale_translations
    target_locale = (@model.default_language.presence || I18n.default_locale).to_s
    source_locale = Mobility.locale.to_s
    source_values = localized_assessment_values(source_locale)
    target_values = localized_assessment_values(target_locale)

    if target_values.values.all?(&:blank?) && source_locale != target_locale
      Mobility.with_locale(target_locale) do
        @model.name = source_values[:name] if source_values[:name].present?
        @model.description = source_values[:description] if source_values[:description].present?
        @model.timing = source_values[:timing] if source_values[:timing].present?
      end

      @model.save! if @model.changed?
      target_values = localized_assessment_values(target_locale)
    end

    @model.update_columns(target_values)
  end

  def localized_assessment_values(locale)
    Mobility.with_locale(locale) do
      {
        name: @model.name,
        description: @model.description,
        timing: @model.timing
      }
    end
  end
end
