# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::AIArtifactsController < Api::V2::Administration::BaseController
    include AsyncRequestHandler

    before_action :load_ai_artifact, only: %i[test_generate]

    async_request :generate, handler: AI::CampaignArtifacts::GenerateArtifactRequestHandler,
                             permit_params: lambda { |params|
                               params.permit(:artifact_id, :user_id).merge(
                                 campaign_id: campaign.id
                               )
                             }

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Api::Administration::Campaigns::AIArtifactPolicy,
            context[:user],
            @model,
            %w[index create update destroy import export],
            {
              project_id: context[:project]&.id,
              campaign_id: context[:campaign]&.id
            }
          )
        }
      }
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
          artifact_result = @artifact.results.new(user: nil, results: assistant_response[:results],
                                                  parsed_dependencies: assistant_response[:parsed_dependencies])

          json_response = jsonapi_format(
            artifact_result,
            resource: Api::V2::Administration::Campaigns::AIArtifactResultResource
          )

          json_response[:data]['attributes']['total_input_tokens']  = assistant_response[:input_tokens]
          json_response[:data]['attributes']['total_output_tokens'] = assistant_response[:output_tokens]

          render json: json_response
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

    def export
      audit! :campaign_artifacts_export, campaign,
             payload: { campaign_id: campaign.id },
             campaign: campaign

      AdminJob.call(
        :export_campaign_ai_artifacts,
        { campaign_id: campaign.id },
        current_user
      )

      render json: :ok
    end

    def import
      file = params.dig(:data, :attributes, :file) || params[:file]

      unless file
        return jsonapi_render_errors(
          [{ detail: I18n.t('administration.campaign_ai_artifacts_import.errors.file_required') }],
          status: :unprocessable_entity
        )
      end

      AdminJob.call(
        :import_campaign_ai_artifacts,
        { campaign_id: campaign.id },
        current_user,
        file
      )

      audit! :campaign_artifacts_import, campaign,
             payload: { campaign_id: campaign.id },
             campaign: campaign

      render json: :ok
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::AIArtifactResultPolicy
    end

    private

    def load_ai_artifact
      @artifact = campaign.campaign_ai_artifacts.find(params[:id])
    end
  end
end
