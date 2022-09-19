# frozen_string_literal: true

class Api::V2::Administration::ProjectResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :year, :number, :country

  model_name 'Project'
end
