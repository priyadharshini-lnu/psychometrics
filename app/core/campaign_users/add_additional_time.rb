# frozen_string_literal: true

module CampaignUsers
  class AddAdditionalTime < BaseCommand
    private_attr_reader :campaign_user, :additional_time

    def initialize(campaign_user, additional_time)
      @campaign_user = campaign_user
      @additional_time = additional_time
    end

    def call
      broadcast :invalid unless campaign_user
      broadcast :invalid unless additional_time || additional_time.negative?

      transaction do
        remove_reports if campaign_user.completed_campaign?
        add_additional_time
      end

      broadcast :ok
    end

    private

    def add_additional_time
      campaign_user.update_attributes(
        completion_status: :interrupted,
        additional_time: additional_time,
        expiry_date: nil
      )
    end

    def remove_reports
      campaign_user.user_reports.each do |report|
        report.update!(remove_pdf: true, status: :generating)
      end
    end
  end
end
