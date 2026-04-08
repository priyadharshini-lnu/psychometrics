# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::Occupations::OccupationsFactorsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Dimension::Occupation::OccupationsFactor::Schema
  end
end
