# frozen_string_literal: true

module Administration
  module Projects
    class NewCampaignsController < Administration::Projects::BaseController
      include ::ProjectInitialState

      prepend_before_action :set_resource_class
      skip_after_action :verify_policy_scoped, only: %i[index show]
      before_action :set_campaign, only: %i[
        show update assessments_and_reports fetch_campaign_options fetch_campaign_instructions
        update_campaign_options destroy fetch_descriptions pdf_password
      ]
      render_entrypoint %i[index show], element: 'project-container', entry: 'admin/project'
      before_action :set_project_init_state, only: %i[index show], if: -> { request.format.html? }
      append_before_action :pundit_authorize, except: [:index]

      def index
        unless current_user.campaign_admin_campaigns.exists?(project_id: params[:project_id])
          authorize(Campaign, nil, { project_id: params[:project_id] })
        end
        respond_to do |format|
          format.html
          format.json do
            campaigns = policy_scope(resource_class).where(project_id: project.id).
                        ransack(params[:filters]).
                        result.
                        includes(:reports, :assessments, :project, :threesixty_campaign)

            serialized_campaigns = Panko::ArraySerializer.new(
              campaigns.page(params[:page]).per(params[:size] || 25),
              each_serializer: Administration::Campaigns::CampaignSerializer,
              context: {
                current_user: current_user,
                project_id: params[:project_id]
              }
            ).to_a

            render json: {
              campaigns: serialized_campaigns,
              total: campaigns.count,
              permissions: permissions
            }
          end
        end
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignPolicy,
          current_user,
          nil,
          %w[create],
          {
            project_id: params[:project_id]
          }
        )
      end

      def destroy
        ::Campaigns::Remove.call(@campaign) do
          on(:ok) do
            audit! :delete, @campaign, payload: @campaign.log_attribute_for_delete, campaign: @campaign
            render json: @campaign.id
          end
          on(:error) { |errors| return render json: { errors: errors }, status: 422 }
        end
      end

      def show
        @do_not_render_rails_menu = true
        respond_to do |format|
          format.html { render :index }
          format.json do
            render json: Administration::Campaigns::CampaignSerializer.new(
              context: {
                current_user: current_user
              }
            ).serialize(@campaign)
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
          audit! :update, @campaign, payload: resource_params, campaign: @campaign
          render json: Administration::Campaigns::CampaignSerializer.new(
            context: {
              current_user: current_user
            }
          ).serialize(@campaign)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def templates_and_assessment
        templates = policy_scope(CampaignTemplate).all
        campaigns = project.project_campaigns.where(type: 'threesixty').includes(threesixty_campaign: :assessment)

        render json: Administration::Campaigns::TemplatesAndAssementsSerializer.new.serialize({
          templates: templates, campaigns: campaigns
        })
      end

      def fetch_campaign_options
        campaign_options = @campaign.campaign_options

        render json: Administration::Campaigns::CampaignOptionsSerializer.new.serialize(campaign_options)
      end

      def fetch_campaign_instructions
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            CampaignOptionsLocaleSerializer.new(@campaign.campaign_options, locale: locale).to_h
          end
        end
        available_locales = @campaign.campaign_options.translations.pluck(:locale)
        render json: { list: list, available_locales: available_locales }
      end

      def fetch_descriptions
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            { description: @campaign.campaign_options.description, locale:  locale }
          end
        end
        available_locales = @campaign.campaign_options.translations.pluck(:locale)
        render json: { list: list, available_locales: available_locales }
      end

      def update_campaign_options
        campaign_options = @campaign.campaign_options

        attributes = campaign_options.attributes.merge(campaign_options_params)
        form = ::Campaigns::CampaignOptions::Form.from_params(attributes)

        if form.valid?
          audit! :update_campaign_options, @campaign, payload: campaign_options_params, campaign: @campaign
          Mobility.with_locale(params[:locale]) do
            campaign_options.update(campaign_options_params)
          end
          render json: Administration::Campaigns::CampaignOptionsSerializer.new.serialize(campaign_options)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def set_resource_class
        @_resource_class ||= Campaign # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def pdf_password
        render json: { pdf_password: @campaign.pdf_password }
      end

      private

      def pundit_authorize
        authorize(
          @campaign || Campaign,
          nil,
          {
            project_id: params[:project_id],
            campaign_id: @campaign&.id
          }
        )
      end

      def set_campaign
        @campaign = policy_scope(Campaign).find_by(project_id: params[:project_id], id: params[:id])
      end

      def create_common_campaign
        form = ::Campaigns::Form.from_params(resource_params)
        if form.valid?
          campaign = Campaign.create!(form.attributes.merge(project_id: project.id))
          audit! :create, campaign, payload: resource_params, campaign: campaign
          render json: Administration::Campaigns::CampaignSerializer.new(
            context: {
              current_user: current_user
            }
          ).serialize(campaign)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def create_threesixty_campaign
        form = ::Threesixty::Campaigns::CreateForm.from_params(resource_params)
        if form.valid?
          threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form, current_user)
          audit! :create, threesixty_campaign, payload: resource_params, campaign: threesixty_campaign.campaign
          render json: Administration::Campaigns::CampaignSerializer.new(
            context: {
              current_user: current_user
            }
          ).serialize(threesixty_campaign.campaign)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def campaign_params
        resource_params.permit(:name, :status, :type, :start_date, :end_date)
      end

      def campaign_options_params
        resource_params.permit(
          :fixed_time, :fixed_time_duration, :workshop_booking_requires_prework_completion, :time_zone,
          :instructions_enabled, :instructions, :proctoring_enabled, :proctoring_trial,
          :identification, :description, :integration_type,
          rules: %i[ allow_voices allow_to_use_books allow_to_use_excel allow_to_use_paper
                     allow_to_use_websites allow_absence_in_frame allow_to_use_calculator
                     allow_to_use_messengers allow_wrong_gaze_direction
                     allow_to_use_human_assistant ]
        )
      end
    end
  end
end
