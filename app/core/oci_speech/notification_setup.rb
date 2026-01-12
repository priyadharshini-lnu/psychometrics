# frozen_string_literal: true

module OciSpeech
  class NotificationSetup < BaseCommand
    TOPIC_NAME = "#{Settings.real_env}_speech_transcription_topic".freeze
    COMPARTMENT_ID = Settings.secrets.oci.compartment_id

    WEBHOOK_URL = Rails.application.routes.url_helpers.webhooks_oci_speech_transcription_url(
      host: Settings.domain,
      subdomain: Settings.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    ).freeze

    EVENT_RULES = [
      { name: "#{Settings.real_env}_speech_transcription_created",
        event_type: 'com.oraclecloud.aiservicespeech.createtranscriptionjob' },
      { name: "#{Settings.real_env}_speech_transcription_completed",
        event_type: 'com.oraclecloud.aiservicespeech.completedtranscriptionjob' },
      { name: "#{Settings.real_env}_speech_transcription_failed",
        event_type: 'com.oraclecloud.aiservicespeech.failedtranscriptionjob' }
    ].freeze

    def initialize
      setup_oci_clients
    end

    def call
      setup
    end

    private

    def setup
      Rails.logger.info 'Checking for existing notification infrastructure...'
      cleanup_existing_resources
      Rails.logger.info 'Creating fresh notification infrastructure...'
      create_notification_infrastructure
      log_next_steps
      broadcast(:ok, @topic_id)
    end

    def cleanup_existing_resources
      deleted_rules = delete_existing_event_rules
      deleted_topic = delete_existing_topic
      Rails.logger.info 'No existing resources found' unless deleted_rules || deleted_topic
    end

    def delete_existing_event_rules
      rules = @events_client.list_rules(COMPARTMENT_ID).data
      deleted = false
      EVENT_RULES.each do |rule_config|
        existing_rule = rules.find { |r| r.display_name == rule_config[:name] }
        next unless existing_rule

        @events_client.delete_rule(existing_rule.id)
        Rails.logger.info { "Deleted existing event rule: #{rule_config[:name]}" }
        deleted = true
      end
      deleted
    rescue OCI::Errors::NetworkError, Net::OpenTimeout
      Rails.logger.info 'Network timeout while checking event rules, continuing...'
      false
    end

    def delete_existing_topic
      topics = @notification_control_client.list_topics(COMPARTMENT_ID).data
      existing_topic = topics.find { |t| t.name == TOPIC_NAME }
      return false unless existing_topic

      topic_id_to_wait_for = existing_topic.topic_id

      delete_topic_subscriptions(existing_topic.topic_id)
      @notification_control_client.delete_topic(existing_topic.topic_id)
      Rails.logger.info { "Deleted existing topic: #{TOPIC_NAME}" }
      wait_for_topic_deletion(topic_id_to_wait_for)
      true
    rescue OCI::Errors::NetworkError, Net::OpenTimeout
      Rails.logger.info 'Network timeout while checking topic, continuing...'
      false
    end

    def delete_topic_subscriptions(topic_id)
      subscriptions = @notification_data_client.list_subscriptions(
        COMPARTMENT_ID,
        topic_id: topic_id
      ).data

      subscriptions.each do |sub|
        @notification_data_client.delete_subscription(sub.id)
        Rails.logger.info { "Deleted existing subscription: #{sub.id}" }
      end
    end

    def wait_for_topic_deletion(topic_id)
      check_interval = 15
      elapsed = 0

      Rails.logger.info 'Confirming topic deletion...'

      loop do
        @notification_control_client.get_topic(topic_id)
        sleep check_interval
        elapsed += check_interval
        Rails.logger.info '.' if (elapsed % 35).zero?
      rescue OCI::Errors::ServiceError => e
        if e.status_code == 404
          Rails.logger.info { "Topic deletion confirmed (took #{elapsed}s)" }
          return
        else
          raise
        end
      end
    end

    def create_notification_infrastructure
      create_topic
      Rails.logger.info { "Created topic: #{@topic_id}" }
      create_subscription
      Rails.logger.info 'Created subscription'
      create_event_rules
      Rails.logger.info 'Created event rules'
    end

    def create_topic
      create_topic_details = OCI::Ons::Models::CreateTopicDetails.new(
        name: TOPIC_NAME,
        compartment_id: COMPARTMENT_ID,
        description: 'OCI Speech transcription job notifications'
      )
      response = @notification_control_client.create_topic(create_topic_details)
      @topic_id = response.data.topic_id
    end

    def create_subscription
      subscription_details = OCI::Ons::Models::CreateSubscriptionDetails.new(
        topic_id: @topic_id,
        protocol: 'CUSTOM_HTTPS',
        endpoint: WEBHOOK_URL,
        compartment_id: COMPARTMENT_ID
      )
      @notification_data_client.create_subscription(subscription_details)
    end

    def create_event_rules
      EVENT_RULES.each do |rule_config|
        create_event_rule(rule_config[:name], rule_config[:event_type])
      end
    rescue OCI::Errors::NetworkError, Net::OpenTimeout
      Rails.logger.info 'Network timeout while creating event rules.'
      Rails.logger.info 'Topic and subscription are created successfully.'
    end

    def create_event_rule(rule_name, event_type)
      rule_details = OCI::Events::Models::CreateRuleDetails.new
      rule_details.display_name = rule_name
      rule_details.description = "Route AI Speech #{event_type} to notification topic"
      rule_details.is_enabled = true
      rule_details.compartment_id = COMPARTMENT_ID
      condition = {
        eventType: [event_type],
        data: {
          resourceName: ["#{Settings.real_env}*"]
        }
      }
      rule_details.condition = condition.to_json

      action_list = OCI::Events::Models::ActionList.new
      notification_action = OCI::Events::Models::NotificationServiceAction.new
      notification_action.action_type = 'ONS'
      notification_action.is_enabled = true
      notification_action.description = 'Send to notification topic'
      notification_action.topic_id = @topic_id

      action_list.actions = [notification_action]
      rule_details.actions = action_list

      @events_client.create_rule(rule_details)
      Rails.logger.info { "Created event rule: #{rule_name}" }
    end

    def setup_oci_clients
      @speech_client = OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)
      @notification_control_client = OCI::Ons::NotificationControlPlaneClient.new(config: Psy::Oci.config)
      @notification_data_client = OCI::Ons::NotificationDataPlaneClient.new(config: Psy::Oci.config)
      @events_client = OCI::Events::EventsClient.new(config: Psy::Oci.config)
      Rails.logger.info 'OCI clients initialized'
    end

    def log_next_steps
      Rails.logger.info { "Setup complete! Topic ID: #{@topic_id}" }
      Rails.logger.info { "1. Check #{WEBHOOK_URL} for confirmation" }
      Rails.logger.info '2. Click the confirmation link to activate subscription'
      Rails.logger.info '3. Create a transcription job to test'
    end
  end
end
