# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class Contract < Api::Base::Contract
        config.messages.namespace = :report_approval_settings

        rule(data: { attributes: :qc_user_ids }).validate(:validates_admins)
        rule(data: { attributes: :approver_user_ids }).validate(:validates_admins)
        rule(data: { attributes: :approval_notification_user_ids }).validate(:validates_admins)

        register_macro(:validates_admins) do
          admins = admins_for_campaign(_context[:campaign].id)
          key.failure(:validates_admins) if value&.any? { |v| admins.exclude?(v) }
        end

        def admins_for_campaign(campaign_id)
          ::User.with_access_to_campaign(campaign_id).pluck(:id)
        end
      end
    end
  end
end
