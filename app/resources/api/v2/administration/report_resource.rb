# frozen_string_literal: true

class Api::V2::Administration::ReportResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[name_cont]
end
