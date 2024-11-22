# frozen_string_literal: true

module Api
  module V1
    class UsersController < Api::V1::BaseController
      def index
        user = project.end_users.find_by(email: params[:email])
        if user
          render json: Api::V1::UserSerializer.new.serialize(user)
        else
          raise Api::Errors::ResourceNotFound, "User with email=#{params[:email]} was not found"
        end
      end

      def create
        normalized_params = Api::NormalizeCampaignParams.call!(params)
        form = Api::V1::Users::CreateForm.from_params(normalized_params).with_context(project: project)

        if form.valid?
          user = normalized_params[:campaigns].map do |campaign_attrs|
            campaign = Campaign.find(campaign_attrs[:id])
            # rubocop:disable Style/OpenStructUse
            struct = OpenStruct.new(
              email: form.email,
              first_name: form.first_name,
              last_name: form.last_name,
              operation: campaign_attrs[:existing_record],
              active: campaign_attrs[:active],
              schedule_start_date: campaign_attrs[:schedule_start_date],
              schedule_end_date: campaign_attrs[:schedule_end_date]
            )
            # rubocop:enable all
            response = ::Campaigns::Users::Create.call(struct, campaign, current_user) do
              on(:insufficient_license) { |error| raise Api::Errors::NotEnoughLicences, error }
            end
            audit! :api_create, response[:ok], payload: params, campaign: campaign

            response[:ok]
          end.sample
          render json: Api::V1::UserSerializer.new(
            context: {
              project: project
            }
          ).serialize(user)
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Users::UpdateForm.from_params(params[:user]).with_context(project: project, user: user)
        ::Users::Update.call(form, project, user) do
          on(:invalid) { |f| render_validation_errors(f) }
          on(:ok) do |user|
            audit! :api_update, user, payload: params, project: project
            render json: Api::V1::UserSerializer.new(
              context: {
                project: project
              }
            ).serialize(user)
          end
        end
      end

      def sso
        url, expires_at = ::Users::BuildSsoUrl.call(project, user)[:ok]
        user_assessments = UserAssessments::OrderedAssessments.call!(user)

        render json: {
          expires_at: expires_at,
          url: url,
          assessments: user_assessments.map do |ua|
                         Api::V1::SsoAssignSerializer.new(context: { url: url }).serialize(ua)
                       end
        }
      end

      def assessments_reports
        form = Api::V1::Users::AssessmentsAndReportsForm.from_params(params).
               with_context(campaign_user: campaign_user, campaign: campaign)
        if form.valid?
          ::Campaigns::UserReports::Add.call(form, campaign_user, current_user) do
            on(:error) { |error| raise Api::Errors::NotEnoughLicences, error }
          end
          audit! :assessments_reports, campaign_user, payload: params, campaign: campaign_user.campaign
          render json: Api::V1::UserAssessmentsAndReportsSerializer.new.serialize(campaign_user)
        else
          render_validation_errors(form)
        end
      end

      def search
        render json: Api::UserSearchQuery.new(project, search_params).query
      end

      private

      def user_id
        params[:id]
      end

      def pundit_authorize
        authorize(
          User,
          nil,
          policy_class: ::Administration::Campaigns::UserPolicy,
          project_id: project.id
        )
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end

      def search_params
        params.permit(:id, :email, :first_name, :last_name, datasheet: {}).to_h
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
