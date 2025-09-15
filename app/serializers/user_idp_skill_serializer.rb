# frozen_string_literal: true

class UserIdpSkillSerializer < Panko::Serializer
  attributes :name, :description, :initial_rating, :final_rating, :skill_type, :user_idp_development_actions

  delegate :skill, to: :object
  delegate :name, :description, :skill_type, to: :skill, allow_nil: true

  def user_idp_development_actions
    Panko::ArraySerializer.new(
      object.user_idp_development_actions.where(private: false),
      each_serializer: UserIdpDevelopmentActionSerializer,
      context: context
    ).to_a
  end
end
