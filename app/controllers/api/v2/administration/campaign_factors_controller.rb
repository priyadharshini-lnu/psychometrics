# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactor::Schema
    validates_request_schema :bulk_update, Api::V2::CampaignFactor::Schema.bulk_update
    validates_request_schema :create, Api::V2::CampaignFactor::Contract.new
    validates_request_schema :update, Api::V2::CampaignFactor::Contract.new

    def bulk_update
      result = ::CampaignFactors::BulkUpdate.call(campaign, params[:data])
      audit! :bulk_update_campaign_factors, campaign, payload: params, campaign: campaign

      if result[:ok]
        render json: :ok
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def update_positions
      result = ::CampaignFactors::UpdatePositions.call(campaign, params[:data])
      audit! :update_positions, campaign, payload: params, campaign: campaign

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def export
      audit! :export_campaign_factors, nil, record_type: CampaignFactor, payload: nil, campaign: campaign

      AdminJob.call(
        :export_campaign_factors,
        { campaign_id: campaign.id },
        current_user
      )
      render json: :ok
    end

    def import
      form = ::CampaignFactors::ImportForm.new(file: params[:file]).with_context(campaign: campaign)

      if form.valid?
        AdminJob.call(:import_campaign_factors, { campaign_id: campaign.id }, current_user, params[:file])

        head :ok
      else
        render json: { errors: form.errors.full_messages }, status: 422
      end
    end

    def remove_all
      result = ::CampaignFactors::RemoveAll.call(campaign)
      audit! :remove_all_campaign_factors, campaign, payload: params, campaign: campaign

      if result[:ok]
        render json: :ok
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def validate_campaign_factor_deletion
      result = ::CampaignFactors::ValidateDelete.call(campaign, params[:id])

      render json: { response: result[:ok] }
    end
  end
end
