# frozen_string_literal: true

class Api::V2::Administration::ClientResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :year, :number, :country

  has_one :project_manager

  ransack_filters %i[name_cont name_eq]
end
