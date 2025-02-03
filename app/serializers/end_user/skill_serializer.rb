# frozen_string_literal: true

module EndUser
  class SkillSerializer < Panko::Serializer
    attributes :id, :name, :category
  end
end
