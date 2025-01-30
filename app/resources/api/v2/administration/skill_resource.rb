# frozen_string_literal: true

class Api::V2::Administration::SkillResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :category, :created_at, :updated_at, :owner_id, :tag_list

  has_one :owner

  add_tag_filter

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def owner_id
    @model.owner_id.to_s
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end

  ransack_filters %i[search_query]
end
