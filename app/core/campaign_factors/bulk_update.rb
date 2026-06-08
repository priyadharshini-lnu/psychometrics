# frozen_string_literal: true

module CampaignFactors
  class BulkUpdate < BaseCommand
    private_attr_reader :campaign, :params

    def initialize(campaign, params)
      @campaign = campaign
      @params = params
    end

    def call
      ActiveRecord::Base.transaction do
        params.each do |factor_params|
          campaign_factor = CampaignFactor.find_by!(
            campaign_id: campaign.id,
            id: factor_params[:id]
          )
          handle_rank_reset(factor_params)
          campaign_factor.update!(cf_attributes(factor_params))
        end

        broadcast :ok
      rescue StandardError => e
        broadcast :error, [{ base: e.message }]
      end
    end

    private

    def handle_rank_reset(factor_params)
      attributes = factor_params[:attributes]
      output_type = attributes[:output_type]
      ranked = attributes[:ranked]

      if output_type && output_type != 'numeric'
        campaign.campaign_factors.update_all(ranked: false)
      end

      if ranked
        campaign.campaign_factors.where(ranked: true).update_all(ranked: false)
      end
    end

    def cf_attributes(factor_params)
      factor_params.require(:attributes).permit(
        :code,
        :name,
        :output_type,
        :position,
        :factor_type,
        :public_visibility,
        :assessment_score_type,
        :assessment_id,
        :factor_id,
        :description,
        :ranked,
        :formula,
        :campaign_factor_group_id,
        :min_value,
        :max_value,
        :is_na_allowed,
        :disallow_lead_assessor_moderation
      )
    end
  end
end
