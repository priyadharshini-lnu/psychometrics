# frozen_string_literal: true

module Licenses
  class IsEnoughLicenseCredits < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      license = campaign_user.campaign.proctoring_license
      credits = Campaigns::Proctoring::GetProctoringCredits.call!(campaign_user.campaign)

      broadcast :ok, license.enough_license_credits?(credits)
    end
  end
end
