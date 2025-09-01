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
    return if request.subdomain.present? # Skip for EUI

    set_client
    raise Geo::Exceptions::ClientNotFound unless @client

    @client.check_geo_restriction!
  end

  def handle_geo_restriction(exception)
    case request.format
      when Mime[:json], Mime[:api_json]
        render json: { error: exception.message }, status: :unauthorized
      when Mime[:html], Mime[:js]
        redirect_to '/403'
      else
        head :unauthorized
    end
  end

  def set_client
    @client = client_from_path || client_from_filter || client_from_params
  end

  def client_from_path
    path = request.path.to_s

    case path
      when %r{/clients/(\d+)}
        Client.find_by(id: Regexp.last_match(1))
      when %r{/(?:projects|new_projects)/(\d+)}
        Project.find_by(id: Regexp.last_match(1))&.client
      when %r{/(?:campaigns|new_campaigns|threesixty_campaigns)/(\d+)}
        Campaign.find_by(id: Regexp.last_match(1))&.client
    end
  end

  def client_from_filter
    filter = params[:filter]
    return if filter.blank?

    if (client_id = filter[:client_id_eq] || filter[:owner_id_eq]).present?
      Client.find_by(id: client_id)
    elsif filter[:project_id_eq].present?
      Project.find_by(id: filter[:project_id_eq])&.client
    elsif filter[:campaign_id_eq].present?
      Campaign.find_by(id: filter[:campaign_id_eq])&.client
    end
  end

  def client_from_params
    if params[:client_id].present?
      Client.find_by(id: params[:client_id])
    elsif params[:project_id].present?
      Project.find_by(id: params[:project_id])&.client
    elsif params[:campaign_id].present?
      Campaign.find_by(id: params[:campaign_id])&.client
    end
  end
end
