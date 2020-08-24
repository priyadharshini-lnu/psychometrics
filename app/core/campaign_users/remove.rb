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
      user.user_reports.where(campaign_id: campaign.id).each(&:destroy!)
      remove_user_assessments_and_user_result
      campaign_user.destroy!
    end

    def remove_user_assessments_and_user_result
      user.user_assessments.where(campaign_id: campaign.id).includes(
        users_result: :user_assessments
      ).each do |user_assessment|
        user_assessment.users_result.destroy! if user_assessment.users_result&.user_assessments&.length == 1
        user_assessment.destroy!
      end
    end
  end
end
