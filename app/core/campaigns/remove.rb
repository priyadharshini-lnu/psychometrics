# frozen_string_literal: true

module Campaigns
  class Remove < BaseCommand
    private_attr_reader :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      if campaign.threesixty?
        destroy_threesixty_campaign
      else
        destroy_campaign
      end
    end

    private

    def destroy_threesixty_campaign
      if can_destroy_threesixty_campaign?
        destroy_campaign
      else
        broadcast :error, I18n.t(
          'administration.clients.projects.threesixty_campaigns.destroy.error',
          name: @campaign.decorate.display_name
        )
      end
    end

    def destroy_campaign
      campaign.destroy!
      broadcast :ok
    end

    def can_destroy_threesixty_campaign?
      [campaign.subjects.exists?, campaign.evaluators.exists?, campaign.participants.exists?].none?
    end
  end
end
