# frozen_string_literal: true

class Administration::AppController < Administration::BaseController
  SKIPPED_GEO_RESTRICTION_PATH = [
    %r{^clients/\d+/licenses$},
    %r{^clients/\d+/admins$}
  ].freeze

  skip_before_action :enforce_geo_restriction
  before_action :check_geo_restriction_if_client_context
  skip_after_action :verify_authorized, only: [:dashboard]

  render_entrypoint :dashboard, element: 'admin-app-container', entry: 'admin/admin'

  def dashboard; end

  private

  def check_geo_restriction_if_client_context
    path = params[:all]
    return if current_user.superadmin? && SKIPPED_GEO_RESTRICTION_PATH.any? { |regex| regex.match?(path) }

    return if Settings.features.disable_geo_restriction

    set_client
    @client&.check_geo_restriction!
  end
end
