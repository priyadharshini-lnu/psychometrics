# frozen_string_literal: true

module Administration
  module Projects
    class NewCampaignsController < Administration::Projects::BaseController
      skip_after_action :verify_policy_scoped, only: [:index]
      before_action :init_breadcrumbs

      def index
        @init_state = {}

        respond_to do |format|
          format.html
          format.json do
            campaigns = project.project_campaigns.ransack(params[:filters]).result
            serialized_campaigns = ActiveModelSerializers::SerializableResource.new(
              campaigns.page(params[:page]), each_serializer: Administration::Campaigns::CampaignSerializer
            )
            render json: {
              campaigns: serialized_campaigns,
              total: campaigns.count
            }, each_serializer: Administration::Campaigns::CampaignSerializer
          end
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb t('administration.breadcrumbs.clients'), %i[administration root]
        add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
        add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
      end
    end
  end
end
