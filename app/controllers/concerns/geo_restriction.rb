# frozen_string_literal: true

module GeoRestriction
  extend ActiveSupport::Concern

  included do
    before_action :enforce_geo_restriction
    rescue_from Geo::Exceptions::RestrictedEndpoint, with: :handle_geo_restriction
    rescue_from Geo::Exceptions::ClientNotFound, with: :handle_geo_restriction
  end

  private

  def enforce_geo_restriction
    return if Settings.features.disable_geo_restriction
    return if devise_controller?

    set_client
    raise Geo::Exceptions::ClientNotFound unless @client

    @client.check_geo_restriction!
  end

  def handle_geo_restriction(exception)
    siem_log_authorization_failure(
      resource: request.path,
      action: 'geo_restriction'
    )

    case request.format
      when Mime[:json], Mime[:api_json]
        render json: { error: exception.message }, status: :forbidden
      when Mime[:html], Mime[:js]
        redirect_to '/403'
      else
        head :unauthorized
    end
  end

  def set_client
    @client = ::Clients::ResolveFromRequest.call!(request.path, params)
  end
end
