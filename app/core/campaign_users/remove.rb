# frozen_string_literal: true

module CampaignUsers
  class Remove < BaseCommand
    private_attr_reader :campaign_user, :user, :campaign

    def initialize(options)
      @campaign_user = options[:campaign_user]
      @user = campaign_user.user
      @campaign = campaign_user.campaign
    end

    def call
      user.user_reports.where(campaign_id: campaign.id).find_each(&:destroy!)
      remove_user_assessments_and_user_result
      remove_campaign_factor_values
      campaign_user.destroy!
    end

    def remove_user_assessments_and_user_result
      user.user_assessments.where(campaign_id: campaign.id).destroy_all
    end

    def remove_campaign_factor_values
      user.campaign_factor_values.where(campaign_id: campaign.id).find_each(&:destroy!)
    end
  end
end
