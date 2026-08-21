# frozen_string_literal: true

module CampaignScoring
  class Rescore < BaseCommand
    private_attr_reader :campaign, :user, :campaign_user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
    end

    def call
      lock_manager.lock!(lock_key, 1.minute.in_milliseconds) do
        campaign_user.update!(campaign_scores_finalized: false, campaign_scores_finalized_date: nil)

        campaign_factor_values, = transaction do
          ::CampaignScoring::CalculateAndSave.call!(campaign, user, force_recalculate: true)
        end

        broadcast :ok, campaign_factor_values
      end
    rescue Redlock::LockError => e
      broadcast :error, e.message
    end

    def lock_key
      "locks/rescore/#{campaign.id}/#{campaign_user.id}"
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis], # rubocop:disable Style/GlobalVars
                                            retry_count: 6,
                                            retry_delay: proc { |attempt_number| 200 * (attempt_number**2) })
    end
  end
end
