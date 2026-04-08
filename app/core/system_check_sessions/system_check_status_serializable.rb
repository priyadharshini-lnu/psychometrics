# frozen_string_literal: true

module SystemCheckSessions
  module SystemCheckStatusSerializable
    extend ActiveSupport::Concern

    def system_check_status
      return nil unless system_check_campaign.system_check_enabled?
      return nil if campaign_user.nil?

      system_check_session = find_valid_session

      build_status_response(system_check_session)
    end

    private

    def build_status_response(system_check_session)
      requirements = SystemCheckSessions::RequirementsCalculator.call!(campaign_user)
      status = SystemCheckSessions::GetSystemCheckStatus.call!(
        session: system_check_session,
        requirements: requirements
      )
      all_satisfied = status&.none? { |_check, result| result == :unsatisfied } || false
      is_valid = system_check_session.present? &&
                 (all_satisfied || system_check_campaign.allow_continue_with_warning?)

      {
        session_id: system_check_session&.id,
        is_valid: is_valid,
        requirements: requirements
      }
    end

    def find_valid_session
      session_id = context[:system_check_session_id]
      return nil if session_id.blank?

      system_check_session = SystemCheckSession.find_by(id: session_id, user: context[:current_user])
      return nil unless system_check_session&.valid_for_campaign?(system_check_campaign)

      system_check_session
    end
  end
end
