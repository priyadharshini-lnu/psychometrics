# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillGroupsController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction
      end
    end
  end
end
