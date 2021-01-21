# frozen_string_literal: true

module UsersResults
  class AddAdditionalTime < BaseCommand
    private_attr_reader :user_result, :additional_time

    def initialize(user_result, additional_time)
      @user_result = user_result
      @additional_time = additional_time
    end

    def call
      transaction do
        remove_reports if user_result.completed?
        add_additional_time
        mark_in_progress
      end

      broadcast :ok
    end

    private

    def add_additional_time
      user_result.update_attributes(
        status: :interrupted,
        expiry_date: nil,
        last_activity_at: nil,
        additional_time: additional_time
      )
    end

    def remove_reports
      UserReport.where(report_id: user_result.assessment.report_ids, user_id: user_result.user.id).each do |ur|
        ur.update!(remove_pdf: true, status: :generating)
      end
    end

    def mark_in_progress
      campaign = user_result.user_assessment.campaign
      return if campaign.fixed_time?

      campaign_user = user_result.user.campaign_users.where(campaign_id: campaign.id).first
      ::CampaignUsers::MarkInProgress.call!(campaign_user) if campaign_user
    end
  end
end
