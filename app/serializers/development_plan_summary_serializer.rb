# frozen_string_literal: true

class DevelopmentPlanSummarySerializer < Panko::Serializer
  attributes :skills_by_skill_type_count, :development_actions_by_learning_style_count, :skill_progress_by_skill_type

  def skills_by_skill_type_count
    Idp::DevelopmentAction::SkillsBySkillType.new(development_actions).call
  end

  def development_actions_by_learning_style_count
    Idp::DevelopmentAction::ByLearningStyle.new(development_actions).call
  end

  def skill_progress_by_skill_type
    Idp::DevelopmentAction::SkillsProgressBySkillType.new(development_actions).call
  end

  private

  def skill_types
    ::Skill.skill_types.keys
  end

  def development_actions
    object.active_user_idp_plan.user_idp_development_actions.includes(:development_action, { user_idp_skill: :skill })
  end
end
