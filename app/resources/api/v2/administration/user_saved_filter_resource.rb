# frozen_string_literal: true

class Api::V2::Administration::UserSavedFilterResource < Api::V2::Administration::BaseResource
  attributes :name, :filter_params, :favorite, :resource_type

  before_create -> { @model.user = context[:user] }

  ransack_filters %i[name_cont resource_type_eq favorite_eq]

  has_one :user
end
