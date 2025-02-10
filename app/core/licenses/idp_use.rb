# frozen_string_literal: true

module Licenses
  class IdpUse < BaseCommand
    private_attr_accessor :campaign, :user, :client, :user_idp_plan

    def initialize(campaign, user, user_idp_plan)
      @campaign = campaign
      @user = user
      @user_idp_plan = user_idp_plan
      @client = campaign.client
    end

    def call
      licenses = client.licenses.available.type_idp.order(end_date: :asc)
      return broadcast :ok if LicenseUsage.exists?(campaign: campaign, user: user, consumer: user_idp_plan,
                                                   status: :active)

      license = licenses.detect(&:enough_licenses?)

      if license
        license_usage = license.license_usages.create!(
          campaign: campaign, client: client, user: user,
          consumer: user_idp_plan,
          extras: {
            subject_email: user.email, subject_name: user.name, campaign_name: campaign.name,
            idp_template_name: user_idp_plan.idp_template.name
          }
        )
        return broadcast :ok, license_usage
      end

      raise Licenses::NotEnoughError, I18n.t('licenses.not_enough_idp_license')
    end
  end
end
