# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherReportSerializer < Panko::Serializer
      attributes :id, :name, :permissions, :owner, :assessment_ids,
                 :report_provider, :effective_default_language, :available_languages, :tenant_id

      def owner
        return unless object.owner

        { id: object.owner.id, name: object.owner.name }
      end

      def report_provider
        object.provider
      end

      def effective_default_language
        object.default_language
      end

      def available_languages
        object.other_languages || []
      end

      def assessment_ids
        object.assessment_ids || []
      end

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
