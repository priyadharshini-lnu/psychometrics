# frozen_string_literal: true

class UserIdpSkillSerializer < Panko::Serializer
  attributes :id, :name, :description, :initial_rating, :final_rating, :skill_type, :user_idp_development_actions

  delegate :skill, to: :object
  delegate :name, :description, :skill_type, to: :skill, allow_nil: true

  def user_idp_development_actions
    development_actions = object.user_idp_development_actions.where(private: false)
    development_actions = development_actions.not_deleted if without_deleted
    Panko::ArraySerializer.new(
      development_actions,
      each_serializer: UserIdpDevelopmentActionSerializer,
      context: context
    ).to_a
  end

  def without_deleted
    context[:without_deleted] || false
  end
end
