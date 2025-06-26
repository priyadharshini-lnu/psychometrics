# frozen_string_literal: true

class Api::V2::Administration::Projects::SkillGroupResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :created_at, :updated_at, :project_id

  has_one :project, class_name: 'Client'
end
