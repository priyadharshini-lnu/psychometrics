# frozen_string_literal: true

module LicenseManager
  class Base
    private_attr_reader :license, :campaign, :user, :project, :project_license, :client

    def initialize(license:, campaign:, user:)
      @license = license
      @project = campaign.project
      @campaign = campaign
      @user = user
      @client = campaign.client
      @project_license = find_project_specific_license
    end

    def available?
      return false unless common_checks?

      if license.is_project_specific?
        main_license_available_for_use? && project_license_available_for_use?
      else
        main_license_available_for_use?
      end
    end

    def main_license_available_for_use?
      (license.number + license.overuse_number - license.used_number) >= credits_required
    end

    def project_license_available_for_use?
      return false if project_license.nil?

      return false unless project_license.enabled

      (project_license.usage_limit - project_license.used_number) >= credits_required
    end

    def deduct_license!(**)
      return false unless available?

      license_usage = create_license_usage!(**)
      after_license_usage_created_callback

      { license: license, project_license: project_license, license_usage: license_usage }
    end

    def create_license_usage!(**_kwargs)
      license.license_usages.create!(
        campaign: campaign,
        client: client,
        user: user,
        project: project,
        project_license: project_license,
        extras: {
          subject_name: user.name,
          campaign_name: campaign.name,
          subject_email: user.email
        }
      )
    end

    private

    def after_license_usage_created_callback
      license.increment!(:used_number, credits_required)
      project_license&.increment!(:used_number, credits_required)

      Licenses::OveruseJob.perform_later(license.id) if license.overuse_number.positive?
    end

    def credits_required
      1
    end

    def find_project_specific_license
      return nil unless license.is_project_specific?

      ProjectLicense.find_by(project_id: campaign.project_id, license_id: license.id)
    end

    def common_checks?
      return false if license.disabled
      return false if license.is_project_specific? && project_license.nil?

      Time.zone.today.between?(license.start_date, license.end_date)
    end
  end
end
