# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherReportSerializer < ActiveModel::Serializer
      attributes :id, :name, :permissions

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignReportPolicy,
          instance_options[:current_user],
          object,
          [
            'export'
          ],
          {
            project_id: instance_options[:project_id],
            campaign_id: instance_options[:campaign_id]
          }
        )
      end
    end
  end
end
