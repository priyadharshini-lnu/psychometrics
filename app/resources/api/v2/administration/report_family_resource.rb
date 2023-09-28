# frozen_string_literal: true

class Api::V2::Administration::ReportFamilyResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[name_cont]
end
