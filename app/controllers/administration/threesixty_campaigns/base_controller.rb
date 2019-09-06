# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class BaseController < Administration::BaseController
      append_before_action :pundit_authorize
      rescue_from Errors::LicenseError, with: :render_license_error

      def threesixty_campaign
        @threesixty_campaign ||= ::Threesixty::Campaign.find_by(id: params[:threesixty_campaign_id])
      end

      def pundit_authorize
        authorize(resource || resource_class, nil, threesixty_campaign: threesixty_campaign)
      end

      def render_license_error(e)
        render json: { errors: { licenses: [e.message] } }, status: :forbidden
      end
    end
  end
end
