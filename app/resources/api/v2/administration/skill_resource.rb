# frozen_string_literal: true

class Api::V2::Administration::SkillResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :skill_type, :created_at, :updated_at, :project_id, :tag_list, :global,
             :skill_group_id, :allowed_proficiency_levels

  has_one :project
  has_one :skill_group
  has_many :development_actions

  add_tag_filter

  def records_for_development_actions(_options = {})
    plan_id = context&.dig(:filter, 'available_skills_by_plan_id')

    user_idp_plan = UserIdpPlan.find_by(id: plan_id)
    return @model.development_actions unless user_idp_plan

    ::Idp::DevelopmentAction::AvailableActionsQuery.new(@model, user_idp_plan).query
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

  def skill_group_id
    @model.skill_group_id.to_s
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

  def allowed_proficiency_levels
    result = Skills::GetProficiencyLevel.call(@model)
    proficiency_level = result[:ok][:proficiency_level]

    return {} unless proficiency_level && proficiency_level[:level_definition].present?

    proficiency_level[:level_definition].each_with_object({}) do |defn, hash|
      hash[defn['level']] = defn['name']
    end
  end

  ransack_filters %i[
    name_cont
    skill_type_in
    global
    all_skills
    filterable_fields
    by_idp_template_id
    filter_by_skill_type
    project_id_eq
    available_skills_by_plan_id
  ]
end
