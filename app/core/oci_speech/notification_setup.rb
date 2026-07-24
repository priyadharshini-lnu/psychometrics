# frozen_string_literal: true

module OciSpeech
  class NotificationSetup < BaseCommand
    TOPIC_NAME = "#{Settings.real_env}_speech_transcription_topic".freeze
    COMPARTMENT_ID = Settings.secrets.oci.compartment_id
    RULE_NAME = "#{Settings.real_env}_speech_transcription_events".freeze

    WEBHOOK_URL = Rails.application.routes.url_helpers.webhooks_oci_speech_transcription_url(
      host: Settings.domain,
      subdomain: Settings.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    ).freeze

    EVENT_TYPES = [
      'com.oraclecloud.aiservicespeech.createtranscriptionjob',
      'com.oraclecloud.aiservicespeech.completedtranscriptionjob',
      'com.oraclecloud.aiservicespeech.failedtranscriptionjob'
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
      deleted_rule = delete_existing_event_rule
      deleted_topic = delete_existing_topic
      Rails.logger.info 'No existing resources found' unless deleted_rule || deleted_topic
    end

    def delete_existing_event_rule
      rules = @events_client.list_rules(COMPARTMENT_ID).data
      existing_rule = rules.find { |r| r.display_name == RULE_NAME }
      return false unless existing_rule

      @events_client.delete_rule(existing_rule.id)
      Rails.logger.info { "Deleted existing event rule: #{RULE_NAME}" }
      true
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
      create_event_rule
      Rails.logger.info 'Created event rule'
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

    def create_event_rule
      rule_details = OCI::Events::Models::CreateRuleDetails.new
      rule_details.display_name = RULE_NAME
      rule_details.description = 'Route all AI Speech transcription events to notification topic'
      rule_details.is_enabled = true
      rule_details.compartment_id = COMPARTMENT_ID

      condition = {
        eventType: EVENT_TYPES,
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
      Rails.logger.info { "Created event rule: #{RULE_NAME}" }
    rescue OCI::Errors::NetworkError, Net::OpenTimeout
      Rails.logger.info 'Network timeout while creating event rule.'
      Rails.logger.info 'Topic and subscription are created successfully.'
    end

    def setup_oci_clients
      oci_config = Psy::Oci.config

      @speech_client = OCI::AiSpeech::AIServiceSpeechClient.new(config: oci_config)
      @notification_control_client = OCI::Ons::NotificationControlPlaneClient.new(config: oci_config)
      @notification_data_client = OCI::Ons::NotificationDataPlaneClient.new(config: oci_config)
      @events_client = OCI::Events::EventsClient.new(
        config: oci_config,
        endpoint: events_endpoint_for(oci_config.region)
      )
      Rails.logger.info 'OCI clients initialized'
    end

    # TODO: Remove this explicit events endpoint override after OCI fixes
    # https://github.com/oracle/oci-ruby-sdk/issues/90 in a released gem version.
    def events_endpoint_for(region)
      endpoint_template = +'https://events.{region}.oci.{secondLevelDomain}'

      OCI::Regions.get_service_endpoint_for_template(
        region,
        endpoint_template,
        'events'
      )
    end

    def log_next_steps
      Rails.logger.info { "Setup complete! Topic ID: #{@topic_id}" }
      Rails.logger.info { "1. Check #{WEBHOOK_URL} for confirmation" }
      Rails.logger.info '2. Click the confirmation link to activate subscription'
      Rails.logger.info '3. Create a transcription job to test'
    end
  end
end
