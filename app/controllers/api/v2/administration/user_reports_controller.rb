# frozen_string_literal: true

module Api
  module V2
    module Administration
      class UserReportsController < BaseController
        prepend_before_action :set_campaign_id_for_geo_restriction, only: :availability_details

        def availability_details
          if model.prepared?
            return render json: { available: true }
          end

          details = UserReports::UnavailabilityReasonDetails.new(model).query
          render json: details
        end

        private

        def set_campaign_id_for_geo_restriction
          return if params[:campaign_id].present?

          campaign_id = UserReport.where(id: params[:id]).pick(:campaign_id)
          params[:campaign_id] = campaign_id if campaign_id.present?
        end

        def authorize_availability_details
          authorize(
            model,
            :availability_details?,
            policy_class: policy_class,
            project_id: model.campaign.project_id,
            campaign_id: model.campaign_id
          )
        end
      end
    end
  end
end
