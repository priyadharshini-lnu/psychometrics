# frozen_string_literal: true

class IdpTemplate < ApplicationRecord
  extend Mobility

  include RansackSearchableFields
  include ActiveStorageAttachable

  translates :instructions, :title_text, :subtitle_text
  belongs_to :project, class_name: 'Client'
  belongs_to :report
  has_many :idp_template_skills, dependent: :destroy
  has_many :idp_template_development_actions, dependent: :destroy
  has_many :skills, through: :idp_template_skills, dependent: :destroy
  has_many :development_actions, through: :idp_template_development_actions, dependent: :destroy
  has_many :idp_template_reflection_questions, dependent: :destroy
  has_many :reflection_questions, through: :idp_template_reflection_questions

  enum :available_development_actions_selection_type, { none: 0, all: 1, selected: 2 },
       prefix: :available_development_actions
  enum :suggested_development_actions_selection_type, { none: 0, all: 1, selected: 2 },
       prefix: :suggested_development_actions

  store_accessor :skill_settings, %i[behavioral_global behavioral_client], suffix: true
  store_accessor :skill_settings, %i[technical_global technical_client], suffix: true

  has_one_image_attachment :client_logo, variants: [:thumb]
  has_one_image_attachment :background, variants: [:thumb]

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

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end

  def translations=(values)
    values.each do |locale, translation|
      Mobility.with_locale(locale) do
        self.title_text = translation[:title_text]
        self.subtitle_text = translation[:subtitle_text]
      end
    end
  end

  def available_skills
    technical_client_skills = load_setting_based_skill(technical_client_skill_settings, 'technical', project).to_sql
    technical_global_skills = load_setting_based_skill(technical_global_skill_settings, 'technical', nil).to_sql
    behavioral_client_skills = load_setting_based_skill(behavioral_client_skill_settings, 'behavioral', project).to_sql
    behavioral_global_skills = load_setting_based_skill(behavioral_global_skill_settings, 'behavioral', nil).to_sql

    combined_query = [
      technical_client_skills,
      technical_global_skills,
      behavioral_client_skills,
      behavioral_global_skills,
      skills_by_tags
    ].join(' UNION ')

    Skill.from("(#{combined_query}) AS skills")
  end

  private

  def skills_by_tags
    client_queries = []
    if behavioral_client_skill_settings == 'selected'
      client_queries << Skill.where(project: project, skill_type: 'behavioral').
                        tagged_with(behavioural_client_tags, any: true).to_sql
    end

    if technical_client_skill_settings == 'selected'
      client_queries << Skill.where(project: project, skill_type: 'technical').
                        tagged_with(technical_client_tags, any: true).to_sql
    end

    global_queries = []
    if behavioral_global_skill_settings == 'selected'
      global_queries << Skill.where(project: nil, skill_type: 'behavioral').
                        tagged_with(behavioural_global_tags, any: true).to_sql
    end

    if technical_global_skill_settings == 'selected'
      global_queries << Skill.where(project: nil, skill_type: 'technical').
                        tagged_with(technical_global_tags, any: true).to_sql
    end

    all_queries = client_queries + global_queries
    return Skill.none.to_sql if all_queries.empty?

    all_queries.join(' UNION ')
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
end
