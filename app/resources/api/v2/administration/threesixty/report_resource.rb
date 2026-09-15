# frozen_string_literal: true

class Api::V2::Administration::Threesixty::ReportResource < Api::V2::Administration::BaseResource
  attribute :id, format: :id
  attributes :name
end
