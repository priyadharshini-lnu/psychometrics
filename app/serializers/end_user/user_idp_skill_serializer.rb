# frozen_string_literal: true

module EndUser
  class UserIdpSkillSerializer < Panko::Serializer
    attributes :id, :name, :initial_rating, :final_rating, :skill_id

    delegate :skill, to: :object
    delegate :name, to: :skill
  end
end
