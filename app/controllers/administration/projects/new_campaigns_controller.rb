# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Administration
  module Projects
    class NewCampaignsController < Administration::Projects::BaseController
      include ::ProjectInitialState

      prepend_before_action :set_resource_class
      skip_after_action :verify_policy_scoped, only: %i[index show]
      before_action :set_campaign, only: %i[
        show update assessments_and_reports fetch_campaign_options fetch_campaign_instructions
        update_campaign_options destroy fetch_descriptions pdf_password copy fetch_name_translations
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
            campaigns = policy_scope(resource_class).where(project_id: project.id)
            if params.dig(:filters, :tagged_with).present?
              campaigns = campaigns.tagged_with(params[:filters][:tagged_with])
            end
            campaigns = apply_campaign_index_query(campaigns)

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
        form = ::Campaigns::Form.from_params(@campaign.attributes.merge(campaign_form_params))
        if form.valid?
          @campaign.update!(form.attributes.except(:name, 'name'))
          save_campaign_name_translations(@campaign)
          save_campaign_tags(@campaign)
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

      def copy
        audit! :copy, @campaign, payload: {
          source_id: @campaign.id,
          new_name: params.dig(:resource, :name),
          copy_ai_artifacts: params.dig(:resource, :copy_campaign_ai_artifacts),
          copy_factors: params.dig(:resource, :copy_campaign_factors)
        }
        form = ::Campaigns::CopyForm.from_params(campaign_params)
        ::Campaigns::Copy.call!(form, @campaign)

        render json: :ok
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

      def templates_and_assessment
        templates = Administration::CampaignTemplatePolicy::Scope.new(current_user, CampaignTemplate).resolve(client.id)
        campaigns = project.project_campaigns.where(type: 'threesixty').includes(threesixty_campaign: :assessment)

        render json: Administration::Campaigns::TemplatesAndAssementsSerializer.new.serialize({
          templates: templates, campaigns: campaigns
        })
      end

      def export_campaign_translations
        audit! :export_campaign_translations, nil, user: current_user, project: project,
          payload: { project_id: project.id }
        AdminJob.call(:export_campaign_translations, { project_id: project.id }, current_user)

        render json: :ok
      end

      def import_campaign_translations
        form = ::Api::V2::Administration::CampaignTranslationImportForm.new(
          file: params[:file],
          project_id: project.id
        )

        if form.valid?
          audit! :import_campaign_translations, nil, user: current_user, project: project,
            payload: { project_id: project.id, row_count: form.row_count }
          AdminJob.call(:import_campaign_translations, { project_id: project.id }, current_user, form.processed_file)
          render json: :ok
        else
          render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def fetch_campaign_options
        campaign_options = @campaign.campaign_options

        render json: Administration::Campaigns::CampaignOptionsSerializer.new.serialize(campaign_options)
      end

      def fetch_campaign_instructions
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            CampaignOptionsLocaleSerializer.new(
              context: {
                locale: locale
              }
            ).serialize(@campaign.campaign_options)
          end
        end
        available_locales = @campaign.campaign_options.translations.pluck(:locale)
        render json: { list: list, available_locales: available_locales }
      end

      def fetch_descriptions
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            { description: @campaign.campaign_options.description, locale: locale }
          end
        end
        available_locales = @campaign.campaign_options.translations.pluck(:locale)
        render json: { list: list, available_locales: available_locales }
      end

      def fetch_name_translations
        locales = Array(params[:locales]).compact
        list = locales.map do |locale|
          Mobility.with_locale(locale) do
            {
              name: @campaign.name,
              locale: locale
            }
          end
        end

        render json: { list: list, available_locales: @campaign.translations.pluck(:locale) }
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
        @campaign = policy_scope(Campaign).includes(
          taggings: :tag,
          assessments: [
            :translations,
            { icon_attachment: { blob: { variant_records: :image_attachment } } }
          ],
          reports: { icon_attachment: { blob: { variant_records: :image_attachment } } }
        ).find_by(project_id: params[:project_id], id: params[:id])
      end

      def ransack_filters
        params[:filters]&.except(:tagged_with)
      end

      def apply_campaign_index_query(campaigns)
        campaigns.ransack(ransack_filters).
          result.
          includes(
            :project, :threesixty_campaign, :campaign_options,
            taggings: :tag,
            assessments: [
              :translations,
              { icon_attachment: { blob: { variant_records: :image_attachment } } }
            ],
            reports: { icon_attachment: { blob: { variant_records: :image_attachment } } }
          )
      end

      def save_campaign_tags(campaign)
        return unless resource_params.key?(:tag_list)

        campaign.save_tag_with_ownership(resource_params[:tag_list] || [])
        campaign.save!
      end

      def create_common_campaign
        form = ::Campaigns::Form.from_params(campaign_form_params)
        if form.valid?
          campaign = Mobility.with_locale(requested_app_locale) do
            Campaign.create!(form.attributes.merge(project_id: project.id))
          end
          save_campaign_name_translations(campaign)
          save_campaign_tags(campaign)
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
        resource_params.permit(:name, :translated_name, :name_locale,
                               :status, :type, :start_date, :end_date, :copy_campaign_factors,
                               :copy_campaign_ai_artifacts, tag_list: [])
      end

      def campaign_form_params
        campaign_params.except(:translated_name)
      end

      def requested_name_locale
        campaign_params[:name_locale].presence || requested_app_locale
      end

      def requested_app_locale
        I18n.locale.to_s
      end

      def save_campaign_name_translations(campaign)
        app_locale = requested_app_locale
        selected_locale = requested_name_locale

        if campaign_params[:name].present?
          Mobility.with_locale(app_locale) do
            campaign.name = campaign_params[:name]
          end
        end

        if campaign_params[:translated_name].present?
          Mobility.with_locale(selected_locale) do
            campaign.name = campaign_params[:translated_name]
          end
        end

        campaign.save!
      end

      def campaign_options_params
        resource_params.permit(
          :fixed_time, :fixed_time_duration, :workshop_booking_requires_prework_completion, :show_watermark, :time_zone,
          :instructions_enabled, :instructions, :proctoring_enabled, :proctoring_trial, :watermark_content,
          :identification, :description, :integration_type, :proctoring_type, :proctoring_enabled_on_workshop_activity,
          :workshop_invite_requires_prework_completion, :enable_video_call_recording, :enable_mobile_proctoring,
          :system_check_enabled, :system_check_validity, :allow_continue_with_warning,
          :skip_assessment_level_checks, :selective_proctoring_enabled,
          :hide_participant_video, :disable_transcript_download,
          :minimum_upload_speed, :minimum_download_speed,
          :face_detection_enabled, :minimum_face_detection_ratio, :phrase_verification_enabled,
          rules: %i[ allow_voices allow_to_use_books allow_to_use_excel allow_to_use_paper
                     allow_to_use_websites allow_absence_in_frame allow_to_use_calculator
                     allow_to_use_messengers allow_wrong_gaze_direction
                     allow_to_use_human_assistant ]
        )
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
