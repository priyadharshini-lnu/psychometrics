# frozen_string_literal: true

module EndUser
  class IdpSkillSerializer < Panko::Serializer
    attributes :id, :name, :category, :skill_category

    delegate :skill, to: :object
    delegate :name, to: :skill

    def skill_category
      object.skill.skill_type
    end
  end
end
