# frozen_string_literal: true

module ApplicationConfigurationLoggable
  extend ActiveSupport::Concern

  included do
    after_commit :log_application_configuration_change_event, on: %i[create update destroy]
  end

  class_methods do
    def monitored_configuration_attributes(*attributes)
      @monitored_configuration_attributes = attributes.map(&:to_s)
    end

    def get_monitored_configuration_attributes
      @monitored_configuration_attributes
    end
  end

  private

  def log_application_configuration_change_event
    return if siem_logging_disabled?

    changes_to_log = capture_configuration_changes
    return if changes_to_log.empty? && !id_previously_changed? && !previously_new_record? && !destroyed?

    SiemLogger.log_security_event!(
      'ApplicationConfigurationChange',
      actor_name: determine_actor_name,
      context: determine_configuration_context,
      msg: build_log_message(changes_to_log)
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log ApplicationConfigurationChange event for #{self.class.name} ##{id}: #{e.message}")
  end

  def siem_logging_disabled?
    defined?(Settings) && Settings.features.respond_to?(:disable_siem_logging) &&
      Settings.features.disable_siem_logging
  end

  def determine_actor_name
    actor = Current.user || (respond_to?(:modifier) ? modifier : nil) || (respond_to?(:creator) ? creator : nil)
    actor ? SiemLogger.user_identifier(actor.email, actor.id) : 'System'
  end

  def build_log_message(changes_to_log)
    action_type = determine_action_type
    msg = "#{self.class.name.demodulize} #{action_type}"
    msg += ": #{changes_to_log.join(', ')}" if changes_to_log.any? && !destroyed?
    msg += " for ID: #{id}" if destroyed?
    msg
  end

  def determine_action_type
    if previously_new_record?
      'Created'
    elsif destroyed?
      'Deleted'
    else
      'Updated'
    end
  end

  def capture_configuration_changes
    changes_list = []

    monitored = self.class.get_monitored_configuration_attributes
    target_attributes = monitored.presence || (self.class.column_names - %w[id created_at updated_at created_by_id
                                                                            updated_by_id])

    target_attributes.each do |attr|
      next unless saved_change_to_attribute?(attr)

      old_value, new_value = saved_changes[attr]
      changes_list << format_attribute_change(attr, old_value, new_value)
    end

    changes_list
  end

  def format_attribute_change(attr, old_value, new_value)
    if sensitive_attribute?(attr)
      "#{attr.humanize} changed"
    else
      "#{attr.humanize} changed from '#{format_value(old_value)}' to '#{format_value(new_value)}'"
    end
  end

  def sensitive_attribute?(attr)
    attr.to_s.match?(/password|secret|key|token|auth|cert|config/i)
  end

  def format_value(value)
    return 'nil' if value.nil?

    value.to_s.truncate(100)
  end

  def determine_configuration_context
    %i[project client owner_client self_client threesixty_campaign campaign].each do |context_type|
      context = send("#{context_type}_context")
      return context if context
    end

    'Unknown Context'
  rescue StandardError
    'Unknown Context'
  end

  def project_context
    "Project: #{project.name} (#{project.id})" if respond_to?(:project) && project.present?
  end

  def client_context
    "Client: #{client.name} (#{client.id})" if respond_to?(:client) && client.present?
  end

  def owner_client_context
    "Client: #{owner.name} (#{owner.id})" if respond_to?(:owner) && owner.present? && owner.is_a?(Client)
  end

  def self_client_context
    "Client: #{name} (#{id})" if is_a?(Client)
  end

  def threesixty_campaign_context
    if respond_to?(:threesixty_campaign) && threesixty_campaign&.project.present?
      "Project: #{threesixty_campaign.project.name} (#{threesixty_campaign.project.id})"
    end
  end

  def campaign_context
    if respond_to?(:campaign) && campaign.present? && campaign.project.present?
      "Project: #{campaign.project.name} (#{campaign.project.id})"
    end
  end
end
