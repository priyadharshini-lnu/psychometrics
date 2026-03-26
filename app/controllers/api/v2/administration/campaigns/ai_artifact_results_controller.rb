# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::AIArtifactResultsController < Api::V2::Administration::BaseController
    before_action :load_user, only: %i[show change_finalized_artifact_results]
    before_action :load_campaign_artifacts, only: %i[index show]

    def index
      paginated_users = users.ransack(params[:filter]).result.page(params[:page]).per(params[:size])
      campaign_users_by_user_id = @campaign.campaign_users.where(user_id: paginated_users).index_by(&:user_id)

      records_data = paginated_users.map do |user|
        artifacts_results = @campaign_artifacts.map do |artifact|
          artifact.results.find_or_initialize_by(user: user)
        end
        campaign_user = campaign_users_by_user_id[user.id]

        {
          'id' => user.id,
          'user' => jsonapi_format(user, resource: Api::V2::Administration::UserResource),
          'artifacts_results' => jsonapi_format(artifacts_results),
          'generated_at' => artifacts_results.pluck(:updated_at).compact.max,
          'artifact_results_finalized_at' => campaign_user&.campaign_artifact_results_finalized_at
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

    def change_finalized_artifact_results_bulk
      finalized = params[:data][:attributes][:finalized]
      user_ids = params[:data][:attributes][:user_ids]

      audit! :change_finalized_artifact_results_bulk, nil, record_type: CampaignUser,
             payload: params[:data][:attributes], campaign: @campaign

      CampaignUsers::ChangeCampaignArtifactResultsFinalized.call!(
        campaign: @campaign,
        user_ids: user_ids,
        current_user: current_user,
        artifact_results_finalized: finalized
      )

      render json: :ok
    end

    def change_finalized_artifact_results
      campaign_user = CampaignUser.find_by!(campaign_id: @campaign.id, user_id: @user.id)
      finalized = params[:data][:attributes][:finalized]

      audit! :change_finalized_artifact_results, campaign_user,
             payload: params[:data][:attributes], campaign: @campaign

      campaign_user.update!(
        campaign_artifact_results_finalized: finalized,
        campaign_artifact_results_finalized_at: finalized ? Time.current : nil
      )

      render json: json_api_attributes(campaign_user, {
        artifact_results_finalized: campaign_user.campaign_artifact_results_finalized,
        artifact_results_finalized_at: campaign_user.campaign_artifact_results_finalized_at
      })
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
