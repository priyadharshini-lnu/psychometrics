# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherReportSerializer < Panko::Serializer
      attributes :id, :name, :permissions

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignReportPolicy,
          context[:current_user],
          object,
          [
            'export'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      end
    end
  end
end
