# frozen_string_literal: true

module AI
  module CampaignArtifacts
    class GenerateArtifactRequestHandler < AsyncResponseRequest::AsyncRequestHandler
      include AsyncResponseRequest::AIRequestErrorHandler

      def call
        artifact = load_artifact
        user = load_user

        result_generator = AI::CampaignArtifacts::ResultGenerator.new(artifact, user, current_user: current_user)

        result_generator.
          on(:ok) do |_assistant_response|
            artifact_result = artifact.results.find_by!(user: user)
            async_response.response_data = serialize_artifact_result(artifact_result, user)
          end.
          on(:error) do |error_message, error|
            artifact_result = artifact.results.find_or_initialize_by(user: user)
            artifact_result.error = error_message
            error_response = serialize_artifact_result(artifact_result, user)
            handle_error_with_retry(error_response, error)
          end.
          call

        broadcast(:ok, async_response)
      end

      private

      def load_artifact
        campaign.campaign_ai_artifacts.find(params[:artifact_id])
      end

      def load_user
        campaign.users.find(params[:user_id])
      end

      def campaign
        @campaign ||= Campaign.find(params[:campaign_id])
      end

      def serialize_artifact_result(artifact_result, user)
        resource_context = {
          user: current_user,
          params: params,
          campaign: campaign
        }

        jsonapi_response = JSONAPI::ResourceSerializer.new(
          Api::V2::Administration::Campaigns::AIArtifactResultResource
        ).serialize_to_hash(
          Api::V2::Administration::Campaigns::AIArtifactResultResource.new(artifact_result, resource_context)
        )

        campaign_user = CampaignUser.find_by(campaign_id: campaign.id, user_id: user.id)
        jsonapi_response[:meta] = {
          user: JSONAPI::ResourceSerializer.new(
            Api::V2::Administration::UserResource
          ).serialize_to_hash(
            Api::V2::Administration::UserResource.new(user, resource_context)
          ),
          artifact_results_finalized_at: campaign_user&.campaign_artifact_results_finalized_at
        }

        jsonapi_response
      end

      def async_response
        @async_response ||= AsyncResponseRequest::AsyncResponse.new(
          async_request_uuid: context[:async_request_uuid],
          processing_status: :completed
        )
      end
    end
  end
end
