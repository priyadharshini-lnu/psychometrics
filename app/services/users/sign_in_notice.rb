# frozen_string_literal: true

module Users
  # Single source of truth for the "you last signed in / your last attempt failed" notice.
  # Captured at authentication time (the facts are reset moments later) and read once by whichever
  # channel renders it: the server flash for Rails pages, a session marker for the React shell.
  class SignInNotice
    SESSION_KEY = :sign_in_notice
    IMPERSONATION_SESSION_KEYS = %w[impersonated_by_id spoofed].freeze
    I18N_KEYS = {
      'last_unsuccessful' => 'devise.sessions.unsuccessful_sign_in_time',
      'last_sign_in' => 'devise.sessions.signed_in_time'
    }.freeze

    class << self
      # Snapshots the prior sign-in fact and clears the unsuccessful marker, exactly once per sign-in.
      def capture(user)
        notice = build(user)
        user.update(last_unsuccessful_attempt: nil) if user.last_unsuccessful_attempt
        notice
      end

      # One-shot read for the React shell; nil while impersonating, where the banner speaks for itself.
      def consume(session)
        notice = session.delete(SESSION_KEY)
        return if notice.blank? || impersonating?(session)
        return unless I18N_KEYS.key?(notice['kind'])

        { kind: notice['kind'], at: Time.zone.at(notice['at'].to_i) }
      end

      def flash_suffix(notice)
        I18n.t(I18N_KEYS.fetch(notice['kind']), date_time: I18n.l(Time.zone.at(notice['at'].to_i), format: :short))
      end

      private

      def build(user)
        if user.last_unsuccessful_attempt.present?
          { 'kind' => 'last_unsuccessful', 'at' => user.last_unsuccessful_attempt.to_i }
        elsif user.last_sign_in_at.present?
          { 'kind' => 'last_sign_in', 'at' => user.last_sign_in_at.to_i }
        end
      end

      def impersonating?(session)
        IMPERSONATION_SESSION_KEYS.any? { |key| session[key].present? }
      end
    end
  end
end
