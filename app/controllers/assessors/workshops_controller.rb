# frozen_string_literal: true

class Assessors::WorkshopsController < Assessors::BaseController
  skip_before_action :enforce_geo_restriction
  render_entrypoint :index, element: 'admin-app-container', entry: 'admin/admin'
end
