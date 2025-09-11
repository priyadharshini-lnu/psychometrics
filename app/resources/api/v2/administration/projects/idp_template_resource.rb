# frozen_string_literal: true

class Api::V2::Administration::Projects::IdpTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :self_rating_enabled,
             :technical_client_skill_settings, :technical_global_skill_settings,
             :behavioral_client_skill_settings, :behavioral_global_skill_settings,
             :behavioural_global_tags, :behavioural_client_tags,
             :technical_global_tags, :technical_client_tags,
             :logo_type, :title_text, :subtitle_text, :fields,
             :background, :client_logo, :show_reflections, :reflection_questions,
             :instructions, :translations, :available_locales, :status, :allow_edit,
             :ai_enabled, :ai_assisted_idp_enabled, :one_click_idp_enabled, :skill_source_preference

  has_one :project, class_name: 'Client'
  has_one :report
  has_many :idp_template_skills
  has_many :skills, through: :idp_template_skills, class_name: 'Skill'
  has_one :one_click_ai_assistant, class_name: 'AI::Assistant'
  has_one :document_analysis_ai_assistant, class_name: 'AI::Assistant'

  ransack_filters %i[filterable_fields status_eq]

  def self.updatable_fields(_)
    super + %i[translations]
  end

  def translations
    @model.translations.group_by(&:locale).transform_values do |translations|
      translations.each_with_object({}) do |translation, hash|
        hash[:title_text] = translation.title_text
        hash[:subtitle_text] = translation.subtitle_text
      end
    end
  end

  def available_locales
    @model.translations.pluck(:locale).uniq || [I18n.default_locale]
  end

  def reflection_questions
    @model.idp_template_reflection_questions.map do |itrq|
      {
        id: itrq.reflection_question_id.to_s,
        question: itrq.reflection_question.question,
        mandatory: itrq.mandatory,
        min_words: itrq.min_words,
        max_words: itrq.max_words
      }
    end
  end

  def allow_edit
    !UserIdpPlan.exists?(idp_template_id: @model.id)
  end

  def background
    @model.background.url if @model.background.present?
  end

  def client_logo
    @model.client_logo.url if @model.client_logo.present?
  end

  def self.records(opts = {})
    Api::Administration::IdpTemplatePolicy::Scope.new(
      opts[:context][:user],
      IdpTemplate,
      project_id: opts[:context][:params]['project_id'],
      client_id: opts[:context][:params]['client_id']
    ).resolve
  end
end
