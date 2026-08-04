# frozen_string_literal: true

# Administration base on purpose: Assessors::BaseController signs out non-assessors, but this only serves the SPA.
class Assessors::WorkshopsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  skip_after_action :verify_authorized, only: :index
  render_entrypoint :index, element: 'admin-app-container', entry: 'admin/admin'
end
