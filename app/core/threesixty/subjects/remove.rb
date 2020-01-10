# frozen_string_literal: true

module Threesixty
  module Subjects
    class Remove < BaseCommand
      def initialize(subject, threesixty_campaign)
        @subject = subject
        @campaign = threesixty_campaign.campaign
      end

      def call
        subject.users_reports.where(campaign_id: campaign.id).each(&:destroy!)
        subject.evaluated_results.where(campaign_id: campaign.id).each(&:destroy!)
        subject.participants.where(campaign_id: campaign.id).each(&:destroy!)
        subject.destroy!
      end

      private

      attr_reader :subject, :campaign
    end
  end
end
