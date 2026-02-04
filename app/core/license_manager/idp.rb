# frozen_string_literal: true

module LicenseManager
  class Idp < Base
    def create_license_usage!(**kwargs)
      user_idp_plan = kwargs[:idp_plan]
      license.license_usages.create!(
        campaign: campaign,
        user: user,
        client: client,
        project: project,
        project_license: project_license,
        consumer: user_idp_plan,
        extras: {
          subject_name: user.name,
          subject_email: user.email,
          campaign_name: campaign.name,
          idp_template_name: user_idp_plan.idp_template.name
        }
      )
    end
  end
end
