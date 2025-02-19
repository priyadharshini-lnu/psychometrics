# frozen_string_literal: true

class Api::V2::Administration::DataReportJobResource < Api::V2::Administration::BaseResource
  attributes :id, :status, :created_at, :file

  has_one :created_by, class_name: 'User'

  def file
    @model.file&.url
  end
end
