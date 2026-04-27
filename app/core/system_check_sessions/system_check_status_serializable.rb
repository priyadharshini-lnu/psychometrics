# frozen_string_literal: true

module SystemCheckSessions
  module SystemCheckStatusSerializable
    extend ActiveSupport::Concern

    def system_check_status
      return nil unless system_check_campaign.system_check_enabled?
      return nil if system_check_campaign_user.nil?

      SystemCheckSessions::GetSystemCheckStatus.call!(
        session_id: context[:system_check_session_id], campaign_user: system_check_campaign_user
      )
    end
  end
end
