# frozen_string_literal: true

module EndUser
  class UserIdpSkillsSerializer < Panko::Serializer
    attributes :id, :name, :description, :skill_type, :initial_rating, :final_rating, :skill_id

    delegate :name, :description, :skill_type, to: :skill

    private

    def skill
      object.skill
    end
  end
end
