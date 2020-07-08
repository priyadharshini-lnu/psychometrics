# frozen_string_literal: true

module Licenses
  class Use < BaseCommand
    private_attr_accessor :campaign, :user, :report, :client

    def initialize(campaign, user, report)
      @campaign = campaign
      @user = user
      @report = report
      @client = campaign.client
    end

    def call
      licenses = Licenses::FetchQuery.new(client, report).query

      license = licenses.detect(&:enough_licenses?)

      if license
        license_usage = license.license_usages.create!(campaign: campaign, client: client, user: user)
        return broadcast :ok, license_usage
      end

      broadcast :error, I18n.t('licenses.not_enough_license', client_name: client.name, report_name: report.name)
    end
  end
end
