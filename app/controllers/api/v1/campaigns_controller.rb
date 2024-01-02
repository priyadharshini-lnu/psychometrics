# frozen_string_literal: true

module Api
  module V1
    class CampaignsController < Api::V1::BaseController
      before_action :set_campaign, only: %i[show update duplicate assessments_reports get_assessments_reports]
      before_action :pundit_authorize

      def duplicate
        form = Api::V1::Campaigns::DuplicateForm.from_params(params)
        ::Campaigns::Duplicate.call(form, @campaign) do
          on(:invalid) { |f| render_validation_errors(f) }
          on(:ok) { |new_campaign| render json: Api::V1::CampaignSerializer.new.serialize(new_campaign) }
        end
      end

      def index
        project_campaign_ids = project.project_campaign_ids
        campaigns = CampaignUser.includes(:campaign).
                    where(campaign_id: project_campaign_ids, user_id: user.id).
                    map(&:campaign)
        render json: Panko::ArraySerializer.new(
          campaigns,
          each_serializer: Api::V1::CampaignSerializer
        ).to_a
      end

      def show
        render json: Api::V1::CampaignSerializer.new.serialize(@campaign)
      end

      def assign_user
        normalized_params = Api::NormalizeCampaignParams.call!(params)
        form = Api::V1::Campaigns::AttachToUserForm.from_params(normalized_params).
               with_context(project: project, user: user)
        if form.valid?
          normalized_params[:campaigns].map do |campaign_attrs|
            campaign = Campaign.find(campaign_attrs[:id])
            # rubocop:disable Style/OpenStructUse
            struct = OpenStruct.new(
              email: form.email,
              operation: campaign_attrs[:existing_record],
              active: campaign_attrs[:active]
            )
            # rubocop:enable all
            audit! :assign_user, campaign, payload: campaign_attrs.permit!, campaign: campaign
            ::Campaigns::Users::Create.call(struct, campaign, current_user) do
              on(:error) { raise Api::Errors::NotEnoughLicences, 'Not Enough Licenses' }
            end
          end
          render json: Api::V1::UserSerializer.new(
            context: {
              project: project
            }
          ).serialize(user.reload)
        else
          render_validation_errors(form)
        end
      end

      def create
        form = Api::V1::Campaigns::CreateForm.from_params(params)
        if form.valid?
          normalized_params = ::Campaigns::NormalizeApiRequest.call!(campaign_params)
          campaign = Campaign.create!(normalized_params.merge(project_id: project.id))
          audit! :api_create, campaign, payload: params, campaign: campaign
          render json: Api::V1::CampaignSerializer.new.serialize(campaign)
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Campaigns::UpdateForm.from_params(params)
        if form.valid?
          normalized_params = ::Campaigns::NormalizeApiRequest.call!(campaign_params)
          @campaign.update!(normalized_params)
          audit! :api_update, @campaign, payload: params, campaign: @campaign
          render json: Api::V1::CampaignSerializer.new.serialize(@campaign)
        else
          render_validation_errors(form)
        end
      end

      def get_assessments_reports
        render json: Api::V1::CampaignAssessmentsAndReportsSerializer.new.serialize(@campaign)
      end

      def assessments_reports
        form = Api::V1::Campaigns::AssessmentsAndReportsForm.from_params(params).with_context(campaign: @campaign)
        if form.valid?
          ::Campaigns::Reports::Add.call(form, @campaign, current_user) do
            on(:error) { |error| raise Api::Errors::NotEnoughLicences, error }
          end
          audit! :api_add_assessment_reports, @campaign, payload: params, campaign: @campaign
          render json: Api::V1::CampaignAssessmentsAndReportsSerializer.new.serialize(@campaign)
        else
          render_validation_errors(form)
        end
      end

      private

      def set_campaign
        @campaign =
          begin
            c = Campaign.find_by(project_id: project.id, id: params[:id])
            raise Api::Errors::ResourceNotFound, "Campaign with id=#{params[:id]} is not found" unless c

            c
          end
      end

      def campaign_params
        params.permit(
          :name, :status, :start_date, :end_date, :fixed_time, :duration, :enable_instructions, :instructions,
          :description
        )
      end

      def pundit_authorize
        authorize(
          @campaign || Campaign,
          nil,
          policy_class: ::Administration::CampaignPolicy,
          project_id: project.id,
          campaign_id: @campaign&.id
        )
      end
    end
  end
end
