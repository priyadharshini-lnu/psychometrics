# frozen_string_literal: true

module EndUser
  class IdpSkillSerializer < Panko::Serializer
    attributes :id, :name, :category, :skill_type

    delegate :skill, to: :object
    delegate :name, to: :skill

    def skill_type
      object.skill.skill_type
    end
  end
end
