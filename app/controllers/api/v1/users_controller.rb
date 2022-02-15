# frozen_string_literal: true

module Api
  module V1
    class UsersController < Api::V1::BaseController
      def index
        user = project.end_users.find_by(email: params[:email])
        if user
          render json: user, serializer: Api::V1::UserSerializer
        else
          raise Api::Errors::ResourceNotFound, "User with email=#{params[:email]} was not found"
        end
      end

      def create
        normalized_params = API::NormalizeCampaignParams.call!(params)
        form = Api::V1::Users::CreateForm.from_params(normalized_params).with_context(project: project)

        if form.valid?
          user = normalized_params[:campaigns].map do |campaign_attrs|
            campaign = Campaign.find(campaign_attrs[:id])
            struct = OpenStruct.new(
              email: form.email,
              first_name: form.first_name,
              last_name: form.last_name,
              operation: campaign_attrs[:existing_record],
              active: campaign_attrs[:active]
            )
            response = ::Campaigns::Users::Create.call(struct, campaign, current_user) do
              on(:error) { |error| raise Api::Errors::NotEnoughLicences, error }
            end
            audit! :api_create, user, payload: params.permit!, campaign: campaign

            response[:ok]
          end.sample
          render json: Api::V1::UserSerializer.new(user, project: project).to_h
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Users::UpdateForm.from_params(params[:user]).with_context(project: project, user: user)
        ::Users::Update.call(form, project, user) do
          on(:invalid) { |f| render_validation_errors(f) }
          on(:ok) do |user|
            audit! :api_update, user, payload: params.permit!, project: project
            render json: Api::V1::UserSerializer.new(user, project: project).to_h
          end
        end
      end

      def sso
        url, expires_at = ::Users::BuildSsoUrl.call(project, user)[:ok]
        render json: { expires_at: expires_at, url: url, assessments: user.user_assessments.
          map { |ua| Api::V1::SsoAssignSerializer.new(ua, url: url).to_h } }
      end

      def assessments_reports
        form = Api::V1::Users::AssessmentsAndReportsForm.from_params(params).
               with_context(campaign_user: campaign_user, campaign: campaign)
        if form.valid?
          ::Campaigns::UserReports::Add.call(form, campaign_user) do
            on(:error) { |error| raise Api::Errors::NotEnoughLicences, error }
          end
          audit! :assessments_reports, campaign_user, payload: params.permit!, campaign: campaign_user.campaign
          render json: campaign_user, serializer: Api::V1::UserAssessmentsAndReportsSerializer
        else
          render_validation_errors(form)
        end
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end

      def campaign
        @campaign ||=
          begin
            c = Campaign.find_by(project_id: project.id, id: params[:campaign_id])
            raise Api::Errors::ResourceNotFound, "Campaign with id=#{params[:campaign_id]} was not found" unless c

            c
          end
      end

      def campaign_user
        @campaign_user ||=
          begin
            cu = CampaignUser.find_by(user: user, campaign: campaign)
            unless cu
              raise Api::Errors::ResourceNotFound,
                    "User #{user&.id} does not belong to the campaign with id=#{campaign.id}"
            end

            cu
          end
      end
    end
  end
end
