# frozen_string_literal: true

module LicenseManager
  class Proctoring < Base
    def credits_required
      Campaigns::Proctoring::GetProctoringCredits.call!(campaign)
    end

    def create_license_usage!
      campaign_user = user
      license.license_usages.create!(
        campaign_id: campaign_user.campaign_id,
        user_id: campaign_user.user_id,
        client_id: campaign_user.campaign.client.id,
        project_id: campaign_user.campaign.project.id,
        license_id: license.id,
        project_license_id: project_license&.id,
        extras: {
          subject_name: campaign_user.user.name,
          subject_email: campaign_user.user.email,
          campaign_name: campaign_user.campaign.name
        }
      )
    end
  end
end
