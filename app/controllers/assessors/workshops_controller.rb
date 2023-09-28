# frozen_string_literal: true

class Assessors::WorkshopsController < Assessors::BaseController
  render_entrypoint :index, element: 'assessor-app-container', entry: 'admin/assessor_app'
end
