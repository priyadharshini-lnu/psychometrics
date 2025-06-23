# frozen_string_literal: true

class Api::V2::Administration::SkillGroupResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id, :level_label, :ancestors

  has_one :project

  delegate :level_label, to: :@model

  ransack_filters %i[filterable_fields end_level_groups include_global_groups]

  def ancestors
    @model.ancestors.pluck(:name)
  end

  def self.records(opts = {})
    ::Api::Administration::SkillGroupPolicy::Scope.new(
      opts[:context][:user], ::SkillGroup,
      project_id: opts[:context][:project]&.id
    ).resolve
  end
end
