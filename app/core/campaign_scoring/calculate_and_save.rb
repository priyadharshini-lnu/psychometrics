# frozen_string_literal: true

module CampaignScoring
  class CalculateAndSave < BaseCommand
    private_attr_reader :campaign, :user, :campaign_user, :force_recalculate,
                        :campaign_factor_ids_to_recalculate, :update_campaign_user

    def initialize(campaign, user, force_recalculate: false, campaign_factor_ids_to_recalculate: nil,
                   update_campaign_user: true)
      @campaign = campaign
      @user = user
      @force_recalculate = force_recalculate
      @campaign_factor_ids_to_recalculate = campaign_factor_ids_to_recalculate
      @update_campaign_user = update_campaign_user
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

      indexed_factor_values = CampaignScoring::Calculate.call!(
        campaign,
        user,
        force_recalculate: force_recalculate,
        campaign_factor_ids_to_recalculate: campaign_factor_ids_to_recalculate
      )
      campaign_factor_values = factor_values_to_persist(indexed_factor_values).flat_map do |cf, factor_value|
        persist_factor_value(cf, factor_value, existing_campaign_factor_values[cf.id])
      end

      update_campaign_user! if update_campaign_user

      broadcast :ok, campaign_factor_values, indexed_factor_values
    end

    def update_campaign_user!
      campaign_user_attrs = { campaign_scores_calculated_date: Time.current }
      if ::CampaignUsers::CanAutoFinalizeCampaignScores.call!(campaign, campaign_user, user)
        campaign_user_attrs[:campaign_scores_finalized] = true
        campaign_user_attrs[:campaign_scores_finalized_date] = Time.current
      end
      campaign_user.update!(campaign_user_attrs)
    end

    def persist_factor_value(campaign_factor, factor_value, existing_campaign_factor_value)
      if factor_value.error?
        clear_stale_auto_factor_value(existing_campaign_factor_value)
        return
      end

      if factor_value.value.nil?
        remove_stale_auto_factor_value(existing_campaign_factor_value)
        return
      end

      return existing_campaign_factor_value if reuse_existing_value?(existing_campaign_factor_value)

      campaign_factor_value = existing_campaign_factor_value ||
                              campaign_factor.campaign_factor_values.new(user_id: user.id, campaign_id: campaign.id)
      campaign_factor_value.value = factor_value.value
      campaign_factor_value.label = factor_value.label
      campaign_factor_value.save!
      campaign_factor_value
    end

    def reuse_existing_value?(existing_campaign_factor_value)
      !force_recalculate && existing_campaign_factor_value&.value
    end

    def factor_values_to_persist(indexed_factor_values)
      return indexed_factor_values unless campaign_factor_ids_to_recalculate

      indexed_factor_values.select do |campaign_factor, _|
        campaign_factor.id.in?(campaign_factor_ids_to_recalculate)
      end
    end

    # When recalculation yields no value for a factor (e.g. the assessor / lead assessor
    # evaluations that fed an auto-moderated factor have been reset), the previously stored
    # auto value is stale and must be dropped so the scoring tab falls back to "-".
    # Manual values (lead assessor moderation) are user-entered and are left untouched.
    def remove_stale_auto_factor_value(existing_campaign_factor_value)
      return unless existing_campaign_factor_value&.auto?

      existing_campaign_factor_value.destroy!
    end

    def clear_stale_auto_factor_value(existing_campaign_factor_value)
      return unless existing_campaign_factor_value&.auto?

      existing_campaign_factor_value.update!(numeric_value: nil, string_value: nil, label: nil)
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
