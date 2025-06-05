# frozen_string_literal: true

class UserIdpSkillSerializer < Panko::Serializer
  attributes :name, :description, :initial_rating, :final_rating, :skill_type

  delegate :skill, to: :object
  delegate :name, :description, :skill_type, to: :skill

  has_many :user_idp_development_actions, serializer: UserIdpDevelopmentActionSerializer
end
