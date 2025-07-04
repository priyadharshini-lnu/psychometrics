# frozen_string_literal: true

class Api::V2::ProficiencyLevel::Schema < Api::Base::Schema
  def self.resource
    'proficiency_levels'
  end

  def self.attributes(attribute, _)
    proc do
      attribute[:proficiency_type].filled(:string)
      optional(:skill_category).filled(:string)
      attribute[:level].filled(:integer, gteq?: ProficiencyLevel::MIN_LEVEL, lteq?: ProficiencyLevel::MAX_LEVEL)
      attribute[:level_definition].filled(:array)
    end
  end

  def self.relationships(_)
    [
      { name: :project, resource: :clients, relationship: :one, required: false },
      { name: :skill, resource: :skills, relationship: :one, required: false }
    ]
  end

  def self.links?
    false
  end
end
