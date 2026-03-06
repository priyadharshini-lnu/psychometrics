# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::AIArtifactResultsController < Api::V2::Administration::BaseController
    before_action :load_user, only: [:show]
    before_action :load_campaign_artifacts, only: %i[index show]

    def index
      paginated_users = users.ransack(params[:filter]).result.page(params[:page]).per(params[:size])

      records_data = paginated_users.map do |user|
        artifacts_results = @campaign_artifacts.map do |artifact|
          artifact.results.find_or_initialize_by(user: user)
        end

        {
          'id' => user.id,
          'user' => jsonapi_format(user, resource: Api::V2::Administration::UserResource),
          'artifacts_results' => jsonapi_format(artifacts_results),
          'generated_at' => artifacts_results.pluck(:updated_at).compact.max
        }
      end

      campaign_artifacts_meta = @campaign_artifacts.map do |artifact|
        {
          id: artifact.id,
          name: artifact.name,
          code: artifact.code,
          schema_keys: artifact.assistant_output_schema_keys.map(&:key)
        }
      end

      response = json_api_records(records_data, :campaign_ai_artifact_results)
      response[:meta] = {
        campaign_artifacts: campaign_artifacts_meta,
        record_count: users.count
      }

      render json: response
    end

    def show
      artifacts_results = @campaign_artifacts.map { |artifact| artifact.results.find_or_initialize_by(user: @user) }

      jsonapi_response = jsonapi_format(artifacts_results)
      jsonapi_response[:meta] = jsonapi_response[:meta].merge(
        user: jsonapi_format(@user, resource: Api::V2::Administration::UserResource)
      )

      render json: jsonapi_response
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::AIArtifactResultPolicy
    end

    def export
      audit! :campaign_artifacts_results_export, campaign,
             payload: { campaign_id: campaign.id },
             campaign: campaign

      AdminJob.call(
        :export_campaign_ai_artifacts_results,
        { campaign_id: campaign.id },
        current_user
      )

      render json: :ok
    end

    private

    def users
      return @campaign.campaign_users.none if @campaign_artifacts.blank?

      User.joins(:campaign_users).
        where(campaign_users: { campaign_id: @campaign.id })
    end

    def load_user
      @user = @campaign.users.find(params[:id])
    end

    def load_campaign_artifacts
      @campaign_artifacts = @campaign.campaign_ai_artifacts.includes(:assistant_output_schema_keys, :results)
    end
  end
end
