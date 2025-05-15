# frozen_string_literal: true

class UserIdpPlanSerializer < Panko::Serializer
  attributes :name, :role, :division

  has_many :user_idp_skills, serializer: UserIdpSkillSerializer

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
