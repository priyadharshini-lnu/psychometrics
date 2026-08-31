# frozen_string_literal: true

module Users
  module SecuritySetting
    extend ActiveSupport::Concern

    # rubocop:disable Metrics/BlockLength
    included do
      include SecurityContextLoggable

      validate :validate_password_presence
      validate :validate_password_confirmation
      validate :validate_password_repeats
      validate :validate_password_length, if: :password_required?

      before_save :capture_security_changes
      before_save :capture_alter_user_changes
      before_save :capture_password_change_status
      after_commit :log_user_provision_event, on: :create
      after_commit :log_security_context_change, on: :update
      after_commit :log_alter_user_event, on: :update
      after_commit :log_password_change_event, on: :update
      after_destroy :log_user_deprovision_event

      attr_accessor :security_changes, :alter_user_changes, :password_just_changed

      def log_security_context_change
        return unless security_changes&.any?

        log_security_context_event(
          target_user: self,
          msg: "Security context changed for #{SiemLogger.user_identifier(email, id)}. #{security_changes.join(', ')}"
        )
      end

      def capture_security_changes
        self.security_changes = []
        security_changes << "Role changed from #{changes['role'][0]} to #{changes['role'][1]}" if changes['role']
        security_changes << 'Grants modified' if changes['grants']
      end

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

      def validate_password_presence
        return unless password_required?
        return if password.present?

        errors.add(:password, :blank)
      end

      def validate_password_confirmation
        return unless password_required?
        return if password_confirmation.nil?
        return if password.to_s == password_confirmation.to_s

        errors.add(:password_confirmation, :confirmation, attribute: self.class.human_attribute_name(:password))
      end

      def validate_password_repeats
        return unless restrict_sequences?

        RepeatsInPasswordValidator.new(attributes: [:password]).validate_each(self, :password, password)
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

        begin
          actor = SiemLogger.user_identifier(email, id)
          SiemLogger.log_security_event!('AccountLocked',
                                         actor_name: actor,
                                         context: "Account locked for #{actor}",
                                         msg: "Account locked for #{actor} due to too many failed login attempts",
                                         authentication_channel: 'Password Login')
        rescue StandardError => e
          Rails.logger.error("Failed to log 'AccountLocked' SIEM event for user #{id} || #{email}: " \
                             "#{e.class}: #{e.message}")
        end
      end

      def lock_strategy_enabled?(type)
        security_setting ? security_setting&.lock_account : super
      end

      def saml_enforced_for_admins?
        return false if AdminAuth.saml_disabled_for_admins?
        return false unless admin?
        return true if superadmin?

        email_domain = email.split('@').last
        sso_email_enforced = Settings.saml_enforced_email_domains.include?(email_domain)

        sso_email_enforced && admin?
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
          session_inactivity_timeout_in_seconds: 120.minutes
        )
      end

      # Time to strong sign out
      def timeout_in
        return super if Settings.features.disable_session_timeout

        return 24.hours if is_anonym?

        client_admin_timeout || applicable_security_setting.session_inactivity_timeout_in_seconds.seconds
      end

      def applicable_security_setting
        security_setting || security_setting_for_admin
      end

      def client_admin_timeout
        return unless Current.client_admin_context?

        sso_setting = Current.client&.client_sso_setting
        return unless sso_setting&.saml_login_allowed?

        sso_setting.session_timeout&.seconds
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
end
