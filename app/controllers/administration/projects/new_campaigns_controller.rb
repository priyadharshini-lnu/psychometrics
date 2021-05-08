# frozen_string_literal: true

module Administration
  module Projects
    class NewCampaignsController < Administration::Projects::BaseController
      include ::ProjectInitialState

      skip_after_action :verify_policy_scoped, only: %i[index show]
      append_before_action :pundit_authorize
      before_action :set_campaign, only: %i[
        show update assessments_and_reports fetch_campaign_options
        fetch_campaign_instructions update_campaign_options destroy
      ]
      initial_state_for %i[index show]

      def index
        respond_to do |format|
          format.html
          format.json do
            campaigns = project.project_campaigns.ransack(params[:filters]).
                        result.
                        includes(:reports, :assessments, :project, :threesixty_campaign)
            serialized_campaigns = ActiveModelSerializers::SerializableResource.new(
              campaigns.page(params[:page]), each_serializer: Administration::Campaigns::CampaignSerializer
            )
            render json: {
              campaigns: serialized_campaigns,
              total: campaigns.count,
              permissions: permissions
            }, each_serializer: Administration::Campaigns::CampaignSerializer
          end
        end
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignPolicy,
          current_user,
          nil,
          %w[create]
        )
      end

      def destroy
        ::Campaigns::Remove.call(@campaign) do
          on(:ok) { render json: @campaign.id }
          on(:error) { |errors| return render json: { errors: errors }, status: 422 }
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
        if resource_params[:type] == ::Campaign::THREESIXTY
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

        render json: Administration::Campaigns::TemplatesAndAssementsSerializer.new({
          templates: templates, campaigns: campaigns
        }).to_h
      end

      def fetch_campaign_options
        campaign_options = @campaign.campaign_options

        render json: campaign_options, serializer: Administration::Campaigns::CampaignOptionsSerializer
      end

      def fetch_campaign_instructions
        list = params[:locales].values.map do |locale|
          Mobility.with_locale(locale) do
            CampaignOptionsLocaleSerializer.new(@campaign.campaign_options, locale: locale).to_h
          end
        end
        render json: { list: list, available_locales: @campaign.campaign_options.translations.map(&:locale) }
      end

      def update_campaign_options
        campaign_options = @campaign.campaign_options

        attributes = campaign_options.attributes.merge(campaign_options_params)
        form = ::Campaigns::CampaignOptions::Form.from_params(attributes)

        if form.valid?
          Mobility.with_locale(params[:locale]) do
            campaign_options.update_attributes(campaign_options_params)
          end
          render json: campaign_options, serializer: Administration::Campaigns::CampaignOptionsSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      private

      def pundit_authorize
        authorize @campaign || Campaign
      end

      def set_campaign
        @campaign = policy_scope(Campaign).find_by(project_id: params[:project_id], id: params[:id])
      end

      def create_common_campaign
        form = ::Campaigns::Form.from_params(resource_params)
        if form.valid?
          campaign = Campaign.create!(form.attributes.merge(project_id: project.id))
          render json: campaign, serializer: Administration::Campaigns::CampaignSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def create_threesixty_campaign
        form = ::Threesixty::Campaigns::CreateForm.from_params(resource_params)
        if form.valid?
          threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form)
          render json: threesixty_campaign.campaign, serializer: Administration::Campaigns::CampaignSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def campaign_params
        resource_params.permit(:name, :status, :type, :start_date, :end_date)
      end

      def campaign_options_params
        resource_params.permit(:fixed_time, :fixed_time_duration, :time_zone, :instructions_enabled, :instructions,
                               :proctoring_enabled, :identification,
                               rules: %i[ allow_voices allow_to_use_books allow_to_use_excel allow_to_use_paper
                                          allow_to_use_websites allow_absence_in_frame allow_to_use_calculator
                                          allow_to_use_messengers allow_wrong_gaze_direction
                                          allow_to_use_human_assistant ])
      end
    end
  end
end
