# frozen_string_literal: true

class UserIdpPlanSerializer < Panko::Serializer
  attributes :name, :role, :division, :reflection_questions, :status, :start_date, :assigned_date, :end_date,
             :completed_date, :user_idp_skills

  def user_idp_skills
    Panko::ArraySerializer.new(
      object.user_idp_skills.public_skills.includes(:skill, :user_idp_development_actions),
      each_serializer: UserIdpSkillSerializer,
      context: context
    ).to_a
  end

  def reflection_questions
    Panko::ArraySerializer.new(
      object.idp_template.idp_template_reflection_questions,
      each_serializer: EndUser::ReflectionQuestionSerializer,
      context: context
    ).to_a
  end

  def name
    object.user.name
  end

  def role
    object.user.user_profile.custom_fields['role']
  end

  def division
    object.user.user_profile.custom_fields['division']
  end

  def start_date
    object.started_at&.strftime('%Y-%m-%d')
  end

  def end_date
    object.end_date&.strftime('%Y-%m-%d')
  end

  def assigned_date
    object.created_at&.strftime('%Y-%m-%d')
  end

  def completed_date
    object.completed_at&.strftime('%Y-%m-%d')
  end
end
