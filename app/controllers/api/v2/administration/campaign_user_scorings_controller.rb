# frozen_string_literal: true

module Api
  class V2::Administration::CampaignUserScoringsController < Api::V2::Administration::BaseController
    before_action :find_user, only: %i[change_finalized_campaign_score rescore]

    def index # rubocop:disable Metrics/AbcSize
      sort = @request.parse_sort_criteria(params[:sort])&.first || { field: 'email', direction: :asc }
      limit = limit_and_offset[:limit]
      campaign_users_active_in = params.dig(:filter, :campaign_users_active_in) || 'true'

      query_object = CampaignUsers::CampaignUserScoresQuery.new(
        campaign_id: campaign.id,
        sort: sort,
        filter: {
          limit: limit,
          offset: limit_and_offset[:offset],
          search_term: params.dig(:filter, :search_query),
          campaign_users_active_in: campaign_users_active_in
        }
      )

      total_records = CampaignUser.where(active: campaign_users_active_in.split(','), campaign_id: campaign.id).count
      total_pages = (total_records.to_f / limit).ceil

      campaign_factor_ids = campaign.campaign_factors.pluck(:id).map(&:to_s)
      campaign_user_scores = query_object.query
      modified_scores = campaign_user_scores.map do |score|
        campaign_factor_values = score.slice(*campaign_factor_ids).
                                 map do |key, value|
          parsed_value = value ? JSON.parse(value) : {}
          { campaign_factor_id: key.to_i, value: parsed_value['value'], label: parsed_value['label'] }
        end
        errors = score['campaign_scores_errors']
        {
          id: score['id'].to_s,
          type: 'campaign_users',
          attributes: {
            user: { id: score['user_id'].to_s, email: score['email'],
                    first_name: score['first_name'],
                    last_name: score['last_name'] },
            active: score['active'],
            campaign_scores_calculated_date: score['campaign_scores_calculated_date'],
            campaign_scores_errors: errors ? JSON.parse(errors) : nil,
            campaign_scores_finalized: score['campaign_scores_finalized'],
            campaign_scores_finalized_date: score['campaign_scores_finalized_date'],
            campaign_id: score['campaign_id'],
            stack_rank: score['stack_rank'],
            campaign_factor_values: campaign_factor_values
          }
        }
      end

      render json: {
        data: modified_scores,
        meta: {
          record_count: total_records,
          page_count: total_pages,
          permissions: permissions
        }
      }
    end

    def change_finalized_campaign_score
      campaign_user = ::CampaignUser.find_by(campaign_id: campaign.id, user_id: @user.id)
      audit! :change_finalized_campaign_score, campaign_user, payload: params[:data][:attributes], campaign: campaign

      campaign_user.update!(
        campaign_scores_finalized: params[:data][:attributes][:finalized],
        campaign_scores_finalized_date: params[:data][:attributes][:finalized] ? Time.current : nil
      )

      jsonapi_render json: campaign_user, options: { resource: ::Api::V2::Administration::CampaignUserResource }
    end

    def rescore
      audit! :campaign_scoring_rescore, @user, payload: {}, campaign: campaign
      ::CampaignScoring::Rescore.call!(campaign, @user)

      campaign_user = ::CampaignUser.find_by(campaign_id: campaign.id, user_id: @user.id)
      jsonapi_render json: campaign_user, options: { resource: ::Api::V2::Administration::CampaignUserResource }
    end

    def change_finalized_campaign_score_bulk
      audit! :change_finalized_campaign_score_bulk, nil, record_type: CampaignUser,
        payload: params[:data][:attributes], campaign: campaign
      CampaignUsers::ChangeCampaignScoreFinalized.call!(
        campaign: campaign,
        user_ids: params[:data][:attributes][:user_ids],
        current_user: current_user,
        campaign_score_finalized: params[:data][:attributes][:finalized],
        exclude: params[:data][:attributes][:exclude]
      )

      render json: :ok
    end

    def rescore_bulk
      audit! :campaign_scoring_rescore_bulk, nil, record_type: CampaignUser,
        payload: params[:data][:attributes], campaign: campaign

      AdminJob.call(
        :bulk_rescore_campaign_factors,
        { user_ids: params[:data][:attributes][:user_ids],
          excluded_user_ids: params[:data][:attributes][:excluded_user_ids],
          campaign_id: campaign.id },
        current_user
      )

      render json: {}
    end

    def export_scorings
      audit! :export_campaign_scorings, nil, record_type: CampaignUser, payload: nil, campaign: campaign

      AdminJob.call(
        :export_campaign_scorings,
        {
          campaign_id: campaign.id,
          filters: params.dig(:data, :attributes, :filters) || {}
        },
        current_user
      )
      render json: :ok
    end

    def import_external_campaign_scorings
      form = ::Campaigns::ExternalCampaignScoresImport::ImportForm.new(
        file: params[:file]
      ).with_context(campaign: campaign)

      return render json: { errors: form.errors.full_messages }, status: 422 unless form.valid?

      AdminJob.call(:import_external_campaign_scoring, { campaign_id: campaign.id }, current_user, params[:file])

      head :ok
    end

    def import_external_scorings_sample_file
      send_file(
        Rails.public_path.join('example_csv/import_external_campaign_scorings_sample_file.csv'),
        type: 'text/csv'
      )
    end

    def find_user
      @user = User.find(params[:id])
    end

    def policy_class
      @policy_class ||= Api::Administration::CampaignUserScoringPolicy
    end

    private

    def permissions
      GetPermissionsHash.call!(
        Api::Administration::CampaignUserScoringPolicy,
        context[:user],
        campaign,
        [
          'change_finalized_campaign_score',
          'rescore',
          'change_finalized_campaign_score_bulk',
          'rescore_bulk',
          'export_scorings',
          %w[push_webhook publish_campaign_results_available]
        ],
        { campaign_id: campaign.id }
      )
    end
  end
end
