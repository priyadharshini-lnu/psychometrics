# frozen_string_literal: true

module EndUser
  class UserIdpSkillsSerializer < Panko::Serializer
    attributes :id, :name, :description, :category, :initial_rating, :final_rating, :skill_id

    delegate :name, :description, :category, to: :skill

    private

    def skill
      object.skill
    end
  end
end
