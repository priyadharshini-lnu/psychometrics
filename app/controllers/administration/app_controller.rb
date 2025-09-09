# frozen_string_literal: true

class Administration::AppController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  before_action :check_geo_restriction_if_client_context

  render_entrypoint :dashboard, element: 'admin-app-container', entry: 'admin/admin'

  def dashboard; end

  private

  def check_geo_restriction_if_client_context
    return if Settings.features.disable_geo_restriction

    set_client
    @client&.check_geo_restriction!
  end
end
