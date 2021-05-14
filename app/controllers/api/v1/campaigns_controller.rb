# frozen_string_literal: true

module Api
  module V1
    class CampaignsController < Api::V1::BaseController
      def duplicate
        form = Api::V1::Campaigns::DuplicateForm.from_params(params)
        ::Campaigns::Duplicate.call(form, campaign) do
          on(:invalid) { |f| render_validation_errors(f) }
          on(:ok) { |new_campaign| render json: Api::V1::CampaignSerializer.new(new_campaign).to_h }
        end
      end

      def index
        project_campaign_ids = project.project_campaign_ids
        campaigns = CampaignUser.includes(:campaign).
                    where(campaign_id: project_campaign_ids, user_id: user.id).
                    map(&:campaign)
        render json: campaigns, each_serializer: Api::V1::UserCampaignSerializer
      end

      def assign_user
        normalized_params = API::NormalizeCampaignParams.call!(params)
        form = Api::V1::Campaigns::AttachToUserForm.from_params(normalized_params).
               with_context(project: project, user: user)
        if form.valid?
          normalized_params[:campaigns].map do |campaign_attrs|
            campaign = Campaign.find(campaign_attrs[:id])
            struct = OpenStruct.new(
              email: form.email,
              operation: campaign_attrs[:existing_record],
              active: campaign_attrs[:active]
            )
            ::Campaigns::Users::Create.call(struct, campaign, current_user) do
              on(:error) { raise Errors::Api::NotEnoughLicencesError, 'Not Enough Licenses' }
            end
          end
          render json: Api::V1::UserSerializer.new(user.reload, project: project).to_h
        else
          render_validation_errors(form)
        end
      end

      def create
        form = Api::V1::Campaigns::CreateForm.from_params(params)
        if form.valid?
          normalized_params = ::Campaigns::NormalizeAPIRequest.call!(campaign_params)
          campaign = Campaign.create!(normalized_params.merge(project_id: project.id))
          render json: campaign, serializer: Api::V1::CampaignSerializer
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Campaigns::UpdateForm.from_params(params)
        if form.valid?
          normalized_params = ::Campaigns::NormalizeAPIRequest.call!(campaign_params)
          campaign.update!(normalized_params)
          render json: campaign, serializer: Api::V1::CampaignSerializer
        else
          render_validation_errors(form)
        end
      end

      def assessments_reports
        form = Api::V1::Campaigns::AssessmentsAndReportsForm.from_params(params).with_context(campaign: campaign)
        if form.valid?
          ::Campaigns::Reports::Add.call(form, campaign) do
            on(:error) { |error| raise Errors::Api::NotEnoughLicencesError, error }
          end
          render json: campaign, serializer: Api::V1::CampaignAssessmentsAndReportsSerializer
        else
          render_validation_errors(form)
        end
      end

      def campaign
        @campaign ||=
          begin
            c = Campaign.find_by(project_id: project.id, id: params[:id])
            raise Errors::Api::ResourceNotFoundError, "Campaign with id=#{params[:id]} is not found" unless c

            c
          end
      end

      def campaign_params
        params.permit(
          :name, :status, :start_date, :end_date, :fixed_time, :duration, :enable_instructions, :instructions
        )
      end
    end
  end
end
