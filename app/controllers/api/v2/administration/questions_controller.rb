# frozen_string_literal: true

module Api
  class V2::Administration::QuestionsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
  end
end
