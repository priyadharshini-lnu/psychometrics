# frozen_string_literal: true

class Api::V2::Administration::SkillResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :category, :created_at, :updated_at, :project_id, :tag_list, :global,
             :default_language

  has_one :project

  add_tag_filter

  def created_at
    @model.decorate.created_at
  end

  def global
    @model.project_id.nil?
  end

  def global=(value)
    @model.project_id = nil if value
  end

  def updated_at
    @model.decorate.updated_at
  end

  def project_id
    @model.project_id.to_s
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end

  def self.sortable_fields(context)
    super + %i[project.name]
  end

  ransack_filters %i[name_cont category_in project_id_eq global all_skills filterable_fields]
end
