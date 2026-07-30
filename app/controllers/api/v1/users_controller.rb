# frozen_string_literal: true

module Api
  module V1
    class UsersController < Api::V1::BaseController
      def index
        user = project.end_users.find_by(email: params[:email])
        unless user
          raise Api::Errors::ResourceNotFound, "User with email=#{params[:email]} was not found"
        end

        include_datasheet = params[:datasheet] == 'true'

        options = {
          context: {
            project: project,
            include_datasheet: include_datasheet
          },
          except: include_datasheet ? [] : %i[project_datasheet]
        }

        render json: Api::V1::UserSerializer.new(options).serialize(user)
      end

      def create
        normalized_params = Api::NormalizeCampaignParams.call!(params)
        form = Api::V1::Users::CreateForm.new(normalized_params).with_context(project: project)

        if form.valid?
          Api::Campaigns::Users::Upsert.call(
            form, current_user, params: normalized_params, project: project
          ) do
            on(:ok) do |user|
              audit! :api_create, user, payload: params, project: project
              return render json: Api::V1::UserSerializer.new(
                {
                  context: { project: project, include_datasheet: true }
                }
              ).serialize(user)
            end
            on(:insufficient_license) { |error| raise Api::Errors::NotEnoughLicences, error }
          end
        else
          render_validation_errors(form)
        end
      end

      def update
        normalized_params = Api::NormalizeCampaignParams.call!(params)
        form = Api::V1::Users::UpdateForm.new(normalized_params).with_context(
          project: project, user: user, passed_attributes: normalized_params.keys.map(&:to_sym)
        )

        if form.valid?
          Api::Campaigns::Users::Upsert.call(
            form, current_user, params: normalized_params, project: project, user: user
          ) do
            on(:ok) { |user| audit! :api_update, user, payload: params, project: project }
            on(:insufficient_license) { |error| raise Api::Errors::NotEnoughLicences, error }
          end

          render json: Api::V1::UserSerializer.new(
            {
              context: { project: project, include_datasheet: true }
            }
          ).serialize(user)
        else
          render_validation_errors(form)
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
            on(:new_assessment_response_not_allowed) do |error|
              raise Api::Errors::NewAssessmentResponseNotAllowed, error
            end
            on(:insufficient_license) { |error| raise Api::Errors::NotEnoughLicences, error }
          end
          audit! :assessments_reports, campaign_user, payload: params, campaign: campaign_user.campaign
          render json: Api::V1::UserAssessmentsAndReportsSerializer.new.serialize(campaign_user)
        else
          render_validation_errors(form)
        end
      end

      def results
        render json: {
          finalized: campaign_user.campaign_scores_finalized,
          finalized_at: campaign_user.campaign_scores_finalized_date,
          calculated_at: campaign_user.campaign_scores_calculated_date,
          results: CampaignUsers::Results.call!(campaign_user)
        }
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
        params.expect(user: %i[email first_name last_name password])
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
