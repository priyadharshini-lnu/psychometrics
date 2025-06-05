# frozen_string_literal: true

module EndUser
  class UserIdpSkillSerializer < Panko::Serializer
    attributes :id, :name, :initial_rating, :final_rating, :skill_id, :skill_type

    delegate :skill, to: :object
    delegate :name, to: :skill
    delegate :skill_type, to: :skill
  end
end
