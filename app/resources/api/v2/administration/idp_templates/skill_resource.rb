# frozen_string_literal: true

class Api::V2::Administration::IdpTemplates::SkillResource < Api::V2::Administration::BaseResource
  model_name '::Skill'

  has_many :development_actions

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
