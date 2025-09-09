# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::AIArtifactsController < Api::V2::Administration::BaseController
    before_action :load_user, only: %i[generate]
    before_action :load_ai_artifact, only: %i[generate test_generate]

    def generate
      artifact_result_generator = AI::CampaignArtifacts::ResultGenerator.new(@artifact, @user,
                                                                             current_user: current_user)

      artifact_result_generator.
        on(:ok) do |_assistant_response|
          artifact_result = @artifact.results.find_by!(user: @user)

          jsonapi_response = jsonapi_format(artifact_result,
                                            resource: Api::V2::Administration::Campaigns::AIArtifactResultResource)
          jsonapi_response[:meta] = {
            user: jsonapi_format(@user, resource: Api::V2::Administration::UserResource)
          }

          render json: jsonapi_response
        end.
        on(:error) do |error|
          jsonapi_render_errors [{ detail: error }], status: :unprocessable_entity
        end.
        call
    end

    def test_generate
      test_data = params.dig(:data, :attributes, :test_data) || {}
      options = {
        test_mode: true,
        test_data: test_data,
        current_user: current_user
      }

      artifact_result_generator = AI::CampaignArtifacts::ResultGenerator.new(@artifact, nil, options)

      artifact_result_generator.
        on(:ok) do |assistant_response|
          artifact_results = @artifact.results.new(user: nil, results: assistant_response[:results],
                                                   parsed_dependencies: assistant_response[:parsed_dependencies])

          render json: jsonapi_format(artifact_results,
                                      resource: Api::V2::Administration::Campaigns::AIArtifactResultResource)
        end.
        on(:error) do |error|
          jsonapi_render_errors [{ detail: error }], status: :unprocessable_entity
        end.
        call
    end

    def bulk_generate
      audit! :campaign_artifacts_bulk_generate, nil, record_type: CampaignUser,
        payload: params[:data][:attributes], campaign: campaign

      AdminJob.call(
        :bulk_generate_user_campaign_ai_artifact_results,
        { user_ids: params[:data][:attributes][:user_ids],
          campaign_id: campaign.id },
        current_user
      )

      render json: {}
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::AIArtifactResultPolicy
    end

    private

    def load_user
      @user = @campaign.users.find(params.dig(:query, :user_id))
    end

    def load_ai_artifact
      @artifact = @campaign.campaign_ai_artifacts.find(params[:id])
    end
  end
end
