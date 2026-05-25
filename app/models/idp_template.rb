# frozen_string_literal: true

class IdpTemplate < ApplicationRecord
  extend Mobility

  include RansackSearchableFields
  include ActiveStorageAttachable

  translates :instructions, :title_text, :subtitle_text, :chat_instructions
  belongs_to :project, class_name: 'Client'
  belongs_to :report
  belongs_to :one_click_ai_assistant, class_name: 'AI::Assistant', optional: true
  belongs_to :document_analysis_ai_assistant, class_name: 'AI::Assistant', optional: true
  belongs_to :skill_gap_report_analysis_ai_assistant, class_name: 'AI::Assistant', optional: true
  include Tenantable

  has_many :idp_template_skills, dependent: :destroy
  has_many :idp_template_development_actions, dependent: :destroy
  has_many :skills, through: :idp_template_skills, dependent: :destroy
  has_many :development_actions, through: :idp_template_development_actions, dependent: :destroy
  has_many :idp_template_reflection_questions, dependent: :destroy
  has_many :reflection_questions, through: :idp_template_reflection_questions

  has_many :idp_template_interview_questions, dependent: :destroy
  has_many :interview_questions, through: :idp_template_interview_questions

  enum :available_development_actions_selection_type, { none: 0, all: 1, selected: 2 },
       prefix: :available_development_actions
  enum :suggested_development_actions_selection_type, { none: 0, all: 1, selected: 2 },
       prefix: :suggested_development_actions

  enum :status, { draft: 0, published: 1 }, prefix: true
  enum :skill_source_preference, { from_template: 0, from_ai: 1 }, prefix: true
  enum :guideline_position, { second: 0, second_last: 1 }, prefix: true

  store_accessor :skill_settings, %i[behavioral_global behavioral_client], suffix: true
  store_accessor :skill_settings, %i[technical_global technical_client], suffix: true

  has_one_image_attachment :client_logo, variants: [:thumb]
  has_one_image_attachment :background, variants: [:thumb]

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  def attachment_storage_path(attribute_name, filename)
    "public/projects/#{project.id}/idp_templates/#{id}/#{attribute_name}/#{filename}"
  end

  enum :logo_type, { none: 0, mercer_only: 1, client_only: 2, both: 3 }, prefix: true

  VALID_SKILL_SETTINGS = %w[none all selected].freeze

  validates :behavioral_global_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :behavioral_client_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :technical_global_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :technical_client_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true

  validate :skills_or_tags_must_be_present_if_selected
  validate :skills_on_publishinng, if: :persisted?

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name status]
  end

  def translations=(values)
    values.each do |locale, translation|
      Mobility.with_locale(locale) do
        self.title_text = translation[:title_text]
        self.subtitle_text = translation[:subtitle_text]
      end
    end
  end

  def available_skills(plan_id: nil)
    allow_global = project.project_feature_enabled?(:global_skills)

    skill_ids = Set.new
    technical_client_skills = load_setting_based_skill(technical_client_skill_settings, 'technical', project)
    skill_ids.merge(technical_client_skills.pluck(:id)) unless technical_client_skills.to_sql.include?('WHERE 1=0')

    if allow_global
      technical_global_skills = load_setting_based_skill(technical_global_skill_settings, 'technical', nil)
      skill_ids.merge(technical_global_skills.pluck(:id)) unless technical_global_skills.to_sql.include?('WHERE 1=0')
    end

    behavioral_client_skills = load_setting_based_skill(behavioral_client_skill_settings, 'behavioral', project)
    skill_ids.merge(behavioral_client_skills.pluck(:id)) unless behavioral_client_skills.to_sql.include?('WHERE 1=0')

    if allow_global
      behavioral_global_skills = load_setting_based_skill(behavioral_global_skill_settings, 'behavioral', nil)
      skill_ids.merge(behavioral_global_skills.pluck(:id)) unless behavioral_global_skills.to_sql.include?('WHERE 1=0')
    end

    skills_by_tags_query = load_skills_by_tags
    skill_ids.merge(skills_by_tags_query.pluck(:id)) unless skills_by_tags_query.to_sql.include?('WHERE 1=0')

    return Skill.none.excluding_plan(plan_id: plan_id) if skill_ids.empty?

    Skill.where(id: skill_ids.to_a).excluding_plan(plan_id: plan_id)
  end

  private

  def load_skills_by_tags
    allow_global = project.project_feature_enabled?(:global_skills)
    queries = []

    if behavioral_client_skill_settings == 'selected'
      queries << Skill.where(project: project, skill_type: 'behavioral').
                 tagged_with(behavioural_client_tags, any: true)
    end

    if technical_client_skill_settings == 'selected'
      queries << Skill.where(project: project, skill_type: 'technical').
                 tagged_with(technical_client_tags, any: true)
    end

    if allow_global && behavioral_global_skill_settings == 'selected'
      queries << Skill.where(project: nil, skill_type: 'behavioral').
                 tagged_with(behavioural_global_tags, any: true)
    end

    if allow_global && technical_global_skill_settings == 'selected'
      queries << Skill.where(project: nil, skill_type: 'technical').
                 tagged_with(technical_global_tags, any: true)
    end

    return Skill.none if queries.empty?

    queries.reduce(Skill.none) { |acc, query| acc.or(query) }
  end

  def load_setting_based_skill(setting, skill_type, owner = nil)
    case setting
      when 'all'
        Skill.where(skill_type: skill_type, project: owner)
      when 'selected'
        Skill.where(skill_type: skill_type, project: owner, id: skills.select(:id))
      else
        Skill.none
    end
  end

  def skills_or_tags_must_be_present_if_selected
    result = IdpTemplates::SkillsOrTagsPresenceValidator.call(
      self,
      skills,
      project_id
    )

    if result[:errors].present?
      result[:errors].each do |attribute, error|
        errors.add(attribute, error)
      end
    end
  end

  def skills_on_publishinng
    result = IdpTemplates::SkillsOrTagsPresenceValidator.call(
      self,
      skills,
      project_id
    )
    if result[:errors].present?
      errors.add(:skills, I18n.t('administration.idp.errors.skills_required_on_publishing'))
    end
  end
end
