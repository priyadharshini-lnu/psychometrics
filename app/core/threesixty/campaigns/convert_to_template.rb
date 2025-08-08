# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CampaignHasUserDataError < StandardError
      def message
        I18n.t('administration.threesixty_campaigns.convert_action.has_user_data')
      end
    end

    class ConvertToTemplate < BaseCommand
      ASSOCIATIONS_TO_CHECK = %i[
        participants
        campaign_users
        subjects
        evaluators
        user_assessments
      ].freeze

      attr_reader :campaign

      def initialize(campaign)
        @campaign = campaign
      end

      def call
        if campaign.template?
          return broadcast :error,
                           I18n.t('administration.threesixty_campaigns.convert_action.already_a_template')
        end

        ActiveRecord::Base.transaction do
          ensure_no_user_data_present!
          convert_to_template
          create_campaign_template
        end

        broadcast :ok, { campaign: campaign }
      rescue StandardError => e
        broadcast :error, e.message
      end

      private

      def ensure_no_user_data_present!
        has_data = ASSOCIATIONS_TO_CHECK.any? do |association|
          campaign.public_send(association).exists?
        end

        raise CampaignHasUserDataError if has_data
      end

      def convert_to_template
        campaign.update!(is_template: true)
      end

      def create_campaign_template
        CampaignTemplate.find_or_create_by!(
          campaign: campaign,
          assessment: campaign.threesixty_campaign.assessment,
          report: campaign.threesixty_campaign.report
        ) do |ct|
          ct.name = campaign.name
          ct.owner = campaign.project.client
        end
      end
    end
  end
end
