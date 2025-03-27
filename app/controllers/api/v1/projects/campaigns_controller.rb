# frozen_string_literal: true

module Api
  module V1
    module Projects
      class CampaignsController < Api::V1::BaseController
        before_action :set_project
        before_action :pundit_authorize

        def index
          statuses = params[:status].to_s.split(',').map(&:strip) if params[:status].present?
          form = Api::V1::Campaigns::StatusFilterForm.new(statuses: statuses)

          if form.valid?
            campaigns = Campaign.where(project_id: params[:project_id])
            if params[:status].present?
              campaigns = campaigns.where(status: form.statuses)
            end

            render json: Panko::ArraySerializer.new(
              campaigns,
              each_serializer: Api::V1::CampaignSerializer
            ).to_a
          else
            render_validation_errors(form)
          end
        end

        private

        def set_project
          @project = Project.find(params[:project_id])
        end

        def pundit_authorize
          authorize(
            Campaign,
            nil,
            policy_class: ::Administration::CampaignPolicy,
            project_id: params[:project_id]
          )
        end
      end
    end
  end
end
