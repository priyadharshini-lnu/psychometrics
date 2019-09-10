# frozen_string_literal: true

module Licenses
  class CreateThreesixtySubject < AssignReportBase
    attr_reader :client, :user, :campaign

    def initialize(context)
      @client       = context[:campaign].client
      @user         = context[:user]
      @campaign     = context[:campaign]

      build_license
    end

    def build_license
      license = fetch_available_license
      unless license
        message = 'There are not enough licenses'.html_safe
        raise Errors::LicenseError.new(client, nil, user, message)
      end

      extras = { subject_name: user.decorate.full_name, subject_email: user.email, campaign_name: campaign.name }
      license.license_usages.create!(client: client, user: user, campaign: campaign, extras: extras)
    end

    def fetch_available_license
      client.licenses.available.where(type: :threesixty).order(end_date: :asc).first
    end
  end
end
