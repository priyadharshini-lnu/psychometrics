# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class BaseController < Administration::BaseController
      append_before_action :pundit_authorize
      rescue_from Errors::LicenseError, with: :render_license_error

      def threesixty_campaign
        @threesixty_campaign ||= ::Threesixty::Campaign.find_by(campaign_id: params[:threesixty_campaign_id])
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          {
            threesixty_campaign: threesixty_campaign,
            project_id: params[:project_id] || threesixty_campaign&.campaign&.project_id
          }
        )
      end

      def render_license_error(e)
        render json: { errors: { licenses: [e.message] } }, status: 403
      end
    end
  end
end
