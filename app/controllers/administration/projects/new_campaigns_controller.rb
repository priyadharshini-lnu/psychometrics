# frozen_string_literal: true

module Administration
  module Projects
    class NewCampaignsController < Administration::Projects::BaseController
      skip_after_action :verify_policy_scoped, only: %i[index show]
      append_before_action :pundit_authorize
      before_action :init_breadcrumbs
      before_action :set_campaign, only: %i[show update]

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

      def show
        authorize(Campaign, nil)

        respond_to do |format|
          format.html { render :index }
          format.json do
            render json: Administration::Campaigns::CampaignSerializer.new(@campaign)
          end
        end
      end

      def create
        if params[:type] == ::Campaign::THREESIXTY
          create_threesixty_campaign
        else
          create_common_campaign
        end
      end

      def update
        form = ::Campaigns::Form.from_params(@campaign.attributes.merge(campaign_params))
        if form.valid?
          @campaign.update!(form.attributes)
          render json: campaign, serializer: Administration::Campaigns::CampaignSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def templates_and_assessment
        templates = policy_scope(CampaignTemplate).all
        campaigns = project.project_campaigns.where(type: 'threesixty').includes(threesixty_campaign: :assessment)

        render json: { templates: templates, campaigns: campaigns },
          serializer: Administration::Campaigns::TemplatesAndAssementsSerializer
      end

      private

      def init_breadcrumbs
        add_breadcrumb t('administration.breadcrumbs.clients'), %i[administration root]
        add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
        add_breadcrumb project.decorate.display_name, administration_project_new_campaigns_path(project)
      end

      def pundit_authorize
        authorize @campaign || Campaign
      end

      def set_campaign
        @campaign = policy_scope(Campaign).find_by(project_id: params[:project_id], id: params[:id])
      end

      def create_common_campaign
        form = ::Campaigns::Form.from_params(params)
        if form.valid?
          campaign = Campaign.create!(form.attributes.merge(project_id: project.id))
          render json: campaign, serializer: Administration::Campaigns::CampaignSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def create_threesixty_campaign
        form = ::Threesixty::Campaigns::CreateForm.from_params(params)
        if form.valid?
          threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form)
          render json: threesixty_campaign.campaign, serializer: Administration::Campaigns::CampaignSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def campaign_params
        params[:new_campaign].permit(:name, :status, :type, options: {})
      end
    end
  end
end
