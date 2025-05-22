# frozen_string_literal: true

class UserIdpSkillSerializer < Panko::Serializer
  attributes :name, :description, :initial_rating, :final_rating, :category

  delegate :skill, to: :object
  delegate :name, :description, :category, to: :skill

  has_many :user_idp_development_actions, serializer: UserIdpDevelopmentActionSerializer
end
