# frozen_string_literal: true

module DataReports
  class BaseFieldHandler < BaseCommand
    private_attr_reader :field, :campaign_user, :campaign_scorings, :ctx

    alias cu campaign_user

    def initialize(field, campaign_user:, campaign_scorings: [], ctx: {})
      @field = field
      @campaign_user = campaign_user
      @campaign_scorings = campaign_scorings
      @ctx = ctx
    end
  end
end
