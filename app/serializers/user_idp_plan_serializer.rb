# frozen_string_literal: true

class UserIdpPlanSerializer < Panko::Serializer
  attributes :name, :role, :division, :reflection_questions

  has_many :user_idp_skills, serializer: UserIdpSkillSerializer

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

  delegate :assigned_date, to: :object
end
