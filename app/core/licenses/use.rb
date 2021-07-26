# frozen_string_literal: true

module Licenses
  class Use < BaseCommand
    private_attr_accessor :campaign, :user, :report, :report_family, :client

    def initialize(campaign, user, report, report_family_id)
      @campaign = campaign
      @user = user
      @report = report
      @report_family = ReportFamily.find(report_family_id)
      @client = campaign.client
    end

    def call
      return broadcast :ok if report_family.license_usages.exists?(campaign: campaign, user: user)

      licenses = Licenses::FetchQuery.new(client, report_family.id).query

      license = licenses.detect(&:enough_licenses?)

      if license
        license_usage = license.license_usages.create!(campaign: campaign, client: client, user: user)
        return broadcast :ok, license_usage
      end

      raise Licenses::NotEnoughError,
            I18n.t('licenses.not_enough_license', client_name: client.name, report_name: report.name)
    end
  end
end
