# frozen_string_literal: true

module Campaigns
  class Duplicate < BaseCommand
    attr_reader :form, :campaign

    def initialize(form, campaign)
      @form = form
      @campaign = campaign
    end

    def call
      return broadcast :invalid, form if form.invalid?

      duplicated_campaign = campaign.clone
      duplicated_campaign.update!(form.attributes)

      broadcast :ok, duplicated_campaign
    end
  end
end
