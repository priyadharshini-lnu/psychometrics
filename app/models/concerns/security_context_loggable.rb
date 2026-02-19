# frozen_string_literal: true

module SecurityContextLoggable
  extend ActiveSupport::Concern

  def log_security_context_event(target_user:, msg:, actor: nil)
    raise ArgumentError, 'target_user must be present to log security context event' if target_user.nil?

    actor ||= Current.user || (respond_to?(:modifier) ? modifier : nil) || (respond_to?(:creator) ? creator : nil)
    actor_name = actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
    target_user_identifier = SiemLogger.user_identifier(target_user.email, target_user.id)
    context = "User: #{target_user_identifier}"

    SiemLogger.log_security_event!(
      'UserSecurityContextChange',
      actor_name: actor_name,
      context: context,
      msg: msg
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log UserSecurityContextChange event for #{self.class.name} " \
                       "##{id || 'unknown'}: #{e.message}")
  end

  def log_user_provision_event
    actor = Current.user || creator
    actor_name = actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
    context = "User: #{SiemLogger.user_identifier(email, id)}"

    SiemLogger.log_security_event!(
      'UserProvision',
      actor_name: actor_name,
      context: context,
      msg: "User account created for #{SiemLogger.user_identifier(email, id)}"
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log UserProvision event: #{e.message}")
  end

  def log_alter_user_event
    return unless alter_user_changes&.any?

    actor = Current.user || modifier
    actor_name = actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
    context = "User: #{SiemLogger.user_identifier(email, id)}"
    msg = "User account changed for #{SiemLogger.user_identifier(email, id)}. #{alter_user_changes.join(', ')}"

    SiemLogger.log_security_event!(
      'AlterUser',
      actor_name: actor_name,
      context: context,
      msg: msg
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log AlterUser event: #{e.message}")
  end

  def capture_alter_user_changes
    self.alter_user_changes = []
    pii_attributes = %w[first_name last_name email]
    non_pii_attributes = %w[disabled enable_2fa force_password_change global_assessor]

    pii_attributes.each do |attr|
      alter_user_changes << "#{attr.humanize} changed" if changes.key?(attr)
    end

    non_pii_attributes.each do |attr|
      if changes.key?(attr)
        alter_user_changes << "#{attr.humanize} changed from '#{changes[attr][0]}' to '#{changes[attr][1]}'"
      end
    end

    # Handle unlock (token changed from something to nil)
    if changes['unlock_token'] && changes['unlock_token'][0].present? && changes['unlock_token'][1].nil?
      alter_user_changes << 'Account unlocked'
    end
  end

  def log_user_deprovision_event
    actor = Current.user || modifier
    actor_name = actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
    context = "User: #{SiemLogger.user_identifier(email, id)}"

    SiemLogger.log_security_event!(
      'UserDeprovision',
      actor_name: actor_name,
      context: context,
      msg: "User account deleted for #{SiemLogger.user_identifier(email, id)}"
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log UserDeprovision event: #{e.message}")
  end

  def log_password_change_event
    return unless password_just_changed

    actor = Current.user || modifier
    actor_name = actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
    context = "User: #{SiemLogger.user_identifier(email, id)}"
    msg = "Password changed for #{SiemLogger.user_identifier(email, id)}"

    SiemLogger.log_security_event!(
      'PasswordChange',
      actor_name: actor_name,
      context: context,
      msg: msg
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log PasswordChange event: #{e.message}")
  end

  def capture_password_change_status
    self.password_just_changed = encrypted_password_changed?
  end
end
