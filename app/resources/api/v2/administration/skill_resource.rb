# frozen_string_literal: true

class Api::V2::Administration::SkillResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :category

  ransack_filters %i[search_query]
end
