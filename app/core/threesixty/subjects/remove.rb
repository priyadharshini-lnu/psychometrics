# frozen_string_literal: true

module Threesixty
  module Subjects
    class Remove < BaseCommand
      def initialize(subject, threesixty_campaign)
        @subject = subject
        @campaign = threesixty_campaign.campaign
      end

      def call
        subject.users_reports.where(campaign_id: campaign.id).map &:destroy!
        subject.evaluated_results.map &:destroy!
        Threesixty::Participants::Remove.call!(subject.participants.where(campaign_id: campaign.id), campaign)
        subject.destroy!
      end

      private

      attr_reader :subject, :campaign
    end
  end
end
