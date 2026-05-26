# frozen_string_literal: true

module CampaignFactors
  class SaveAssessorScoringFactorValue < BaseCommand
    private_attr_reader :campaign, :params, :current_user

    def initialize(campaign, params, current_user)
      @campaign = campaign
      @params = params
      @current_user = current_user
    end

    def call
      lead_assessor = Users::GetLeadAssessor.call!(campaign, User.find(params[:user_id]))

      unless current_user.id == lead_assessor&.id
        raise Pundit::NotAuthorizedError, 'You are not authorized to perform this action'
      end

      campaign_user = campaign.campaign_users.find_by(user_id: params[:user_id])
      if campaign_user&.campaign_scores_finalized?
        return broadcast :error, I18n.t('admin.scores_finalized')
      end

      auto_moderated_ids = fetch_auto_moderated_factor_ids
      if auto_moderated_ids.any?
        return broadcast :error, I18n.t('admin.auto_moderated_factor_info')
      end

      transaction do
        params[:scores].each do |score|
          factor_value = campaign.campaign_factor_values.find_or_create_by(
            campaign_factor_id: score[:campaign_factor_id],
            user_id: params[:user_id]
          )

          factor_value.update(numeric_value: score[:score], calculation_type: :manual)
        end
      end

      broadcast :ok
    end

    private

    def fetch_auto_moderated_factor_ids
      score_factor_ids = params[:scores].pluck(:campaign_factor_id)
      CampaignFactor.where(id: score_factor_ids, factor_type: :assessor_scoring,
                           disallow_lead_assessor_moderation: true).pluck(:id)
    end
  end
end
