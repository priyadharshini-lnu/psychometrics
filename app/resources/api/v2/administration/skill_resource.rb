# frozen_string_literal: true

class Api::V2::Administration::SkillResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :skill_type, :created_at, :updated_at, :project_id, :tag_list, :global,
             :skill_group_id

  has_one :project
  has_one :proficiency_level, foreign_key_on: :related,
  resource: '::Api::V2::Administration::ProficiencyLevelResource'

  has_many :development_actions

  add_tag_filter

  def proficiency_level(_options = {})
    result = Skills::GetProficiencyLevel.call(@model)
    proficiency_level = result.dig(:ok, :proficiency_level)
    return [] if proficiency_level.blank?

    Api::V2::Administration::ProficiencyLevelResource.new(proficiency_level, context)
  end

  def created_at
    @model.decorate.created_at
  end

  def global
    @model.project_id.nil?
  end

  def global=(value)
    @model.project_id = nil if value
  end

  def updated_at
    @model.decorate.updated_at
  end

  def project_id
    @model.project_id.to_s
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end

  def self.sortable_fields(context)
    super + %i[project.name]
  end

  def self.records(opts = {})
    super.includes(:translations)
  end

  ransack_filters %i[
    name_cont
    skill_type_in
    project_id_eq
    global
    all_skills
    filterable_fields
    by_idp_template_id
    filter_by_skill_type
  ]
end
