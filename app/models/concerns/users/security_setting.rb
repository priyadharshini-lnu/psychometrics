# frozen_string_literal: true

module Users
  module SecuritySetting
    extend ActiveSupport::Concern

    # rubocop:disable Metrics/BlockLength
    included do
      validates :password, presence: { if: :password_required? }
      validates :password, confirmation: { if: :password_required? }
      validates :password, repeats_in_password: true, if: :restrict_sequences?
      validate :validate_password_length, if: :password_required?

      def generate_strong_password
        ::Utility::String.generate_strong_password(applicable_security_setting.min_password_length)
      end

      def validate_password_length
        return unless password

        password_length = Range.new(applicable_security_setting.min_password_length, 128)
        if password_length.exclude?(password.length)
          errors.add(:password, :too_short, count: password_length.min)
        end
      end

      def password_complexity
        return {} unless applicable_security_setting.enforce_strong_password?

        { digit: 1, lower: 1, symbol: 1, upper: 1 }
      end

      def need_change_password?
        force_password_change? || super
      end

      def expire_password_after
        applicable_security_setting.password_expiration&.days
      end

      def deny_old_passwords
        applicable_security_setting.disable_password_reuse
      end

      def enforce_password_policy_at_sign_in?
        applicable_security_setting.enforce_password_policy
      end

      def restrict_sequences?
        applicable_security_setting.restrict_sequences
      end

      def enforce_strong_password?
        applicable_security_setting.enforce_strong_password
      end

      def password_required?
        return false if new_record? && create_by_invite

        !persisted? || password || password_confirmation
      end

      def maximum_attempts_to_lock
        applicable_security_setting.attempts_to_lock || 3
      end

      def send_unlock_email?
        applicable_security_setting.send_unlock_email
      end

      def unlock_time
        applicable_security_setting.auto_unlock_time&.minutes || 15.minutes
      end

      def session_inactivity_timeout
        applicable_security_setting.session_inactivity_timeout_in_seconds&.seconds || 120.minutes
      end

      def lock_account_enabled?
        applicable_security_setting.lock_account
      end

      def attempts_exceeded?
        failed_attempts >= maximum_attempts_to_lock
      end

      def last_attempt?
        failed_attempts == maximum_attempts_to_lock - 1
      end

      def lock_expired?
        if unlock_strategy_enabled?(:time)
          locked_at && locked_at < unlock_time.ago
        else
          false
        end
      end

      def lock_access!(opts = {})
        self.locked_at = Time.now.utc

        if send_unlock_email? && opts.fetch(:send_instructions, true)
          send_unlock_instructions
        else
          save(validate: false)
        end
      end

      def lock_strategy_enabled?(type)
        security_setting ? security_setting&.lock_account : super(type)
      end

      def security_setting_for_admin
        ::SecuritySetting.new(
          enforce_strong_password: true,
          min_password_length: 12,
          disable_password_reuse: true,
          enforce_password_policy: true,
          restrict_sequences: true,
          auto_unlock_time: 15,
          attempts_to_lock: 3,
          password_expiration: 90,
          send_unlock_email: true,
          session_inactivity_timeout_in_seconds: 15.minutes
        )
      end

      # Time to strong sign out
      def timeout_in
        return super if Settings.features.disable_session_timeout

        return 24.hours if is_anonym?

        applicable_security_setting.session_inactivity_timeout_in_seconds.seconds
      end

      def applicable_security_setting
        security_setting || security_setting_for_admin
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
end
