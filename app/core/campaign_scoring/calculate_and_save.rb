# frozen_string_literal: true

module CampaignScoring
  class CalculateAndSave < BaseCommand
    private_attr_reader :campaign, :user, :campaign_user, :force_recalculate

    def initialize(campaign, user, force_recalculate: false)
      @campaign = campaign
      @user = user
      @force_recalculate = force_recalculate
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
    end

    def call
      lock_manager.lock!(lock_key, 1.minute.in_milliseconds) do
        calculate_and_save_scores
      end
    rescue Redlock::LockError => e
      broadcast :error, e.message
    end

    private

    def calculate_and_save_scores
      return broadcast :campaign_scores_unchanged if campaign_user.campaign_scores_finalized?

      existing_campaign_factor_values =
        campaign.campaign_factor_values.where(user_id: user.id).index_by(&:campaign_factor_id)

      indexed_factor_values = CampaignScoring::Calculate.call!(campaign, user, force_recalculate: force_recalculate)
      campaign_factor_values = indexed_factor_values.flat_map do |cf, factor_value|
        next if factor_value.error? || factor_value.value.nil?
        next existing_campaign_factor_values[cf.id] if reuse_existing_value?(existing_campaign_factor_values[cf.id])

        campaign_factor_value = existing_campaign_factor_values[cf.id] ||
                                cf.campaign_factor_values.new(user_id: user.id, campaign_id: campaign.id)

        campaign_factor_value.value = factor_value.value
        campaign_factor_value.label = factor_value.label
        campaign_factor_value.save!
        campaign_factor_value
      end

      campaign_user_attrs = { campaign_scores_calculated_date: Time.current }
      if ::CampaignUsers::CanAutoFinalizeCampaignScores.call!(campaign, campaign_user, user)
        campaign_user_attrs[:campaign_scores_finalized] = true
        campaign_user_attrs[:campaign_scores_finalized_date] = Time.current
      end
      campaign_user.update!(campaign_user_attrs)

      broadcast :ok, campaign_factor_values, indexed_factor_values
    end

    def reuse_existing_value?(existing_campaign_factor_value)
      !force_recalculate && existing_campaign_factor_value&.value
    end

    def lock_key
      "locks/calculate_and_save/#{campaign.id}/#{campaign_user.id}"
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis], # rubocop:disable Style/GlobalVars
                                            retry_count: 6,
                                            retry_delay: proc { |attempt_number| 200 * (attempt_number**2) })
    end
  end
end
