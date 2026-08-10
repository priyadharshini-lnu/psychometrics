# frozen_string_literal: true

module Api
  module V2
    class Administration::UserPreferencesController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
    end
  end
end
