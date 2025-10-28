# frozen_string_literal: true

module Licenses
  class Use < BaseCommand
    private_attr_accessor :campaign, :user, :report, :report_family, :client, :project

    def initialize(campaign, user, report, report_family_id)
      @campaign = campaign
      @user = user
      @report = report
      @report_family = ReportFamily.find(report_family_id)
      @client = campaign.client
      @project = campaign.project
    end

    def call
      return broadcast :ok if report_family.license_usages.exists?(campaign: campaign, user: user)

      licenses = Licenses::FetchQuery.new(client, report_family.id).query

      license = licenses.detect(&:enough_licenses?)

      unless license
        raise Licenses::NotEnoughError,
              I18n.t('licenses.not_enough_license', client_name: client.name, report_name: report.name)
      end
      project_license = nil

      if license.is_project_specific?
        project_license = ProjectLicense.find_by(
          project_id: campaign.project_id,
          license_id: license.id
        )

        unless project_license&.enabled? && project_license.enough_licenses?
          raise Licenses::NotEnoughError,
                I18n.t('licenses.project_limit_reached')
        end
      end

      license_usage = license.license_usages.create!(campaign: campaign, client: client, user: user, project: project,
                                                     project_license: project_license,
                                                     extras: {
                                                       subject_name: @user.name,
                                                       campaign_name: @campaign.name,
                                                       subject_email: @user.email
                                                     })
      broadcast :ok, license_usage
    end
  end
end
