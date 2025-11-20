# frozen_string_literal: true

module Licenses
  class CreateThreesixtySubject < BaseCommand
    attr_reader :client, :user, :campaign, :project_license

    def initialize(context)
      @client       = context[:campaign].client
      @user         = context[:user]
      @campaign     = context[:campaign]
    end

    def call
      build_license

      broadcast :ok
    end

    def build_license
      license = fetch_available_license
      unless license
        message = 'There are not enough licenses'.html_safe
        raise Errors::LicenseError.new(client, nil, user, message)
      end

      if license.is_project_specific?
        project_license = fetch_project_license?(license)
        unless project_license&.enough_licenses?
          message = I18n.t('licenses.project_limit_reached', license_name: 'ThreeSixty License')
          raise Errors::LicenseError.new(client, nil, user, message)
        end
      end

      extras = { subject_name: user.decorate.full_name, subject_email: user.email, campaign_name: campaign.name }
      license.license_usages.create!(client: client, user: user, campaign: campaign, project: campaign.project,
                                     project_license: project_license, extras: extras)
    end

    def fetch_available_license
      client.licenses.available.where(type: :threesixty).order(end_date: :asc).first
    end

    def fetch_project_license?(license)
      ProjectLicense.enabled.find_by(license_id: license.id, project_id: campaign.project.id)
    end
  end
end
