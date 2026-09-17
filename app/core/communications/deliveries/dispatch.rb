# frozen_string_literal: true

module Communications
  module Deliveries
    class Dispatch < BaseCommand
      VALID_INTERVAL_PERIODS = %w[hours days weeks months].freeze

      def initialize(delivery)
        @delivery = delivery
      end

      def call
        return broadcast(:feature_disabled, delivery) unless Settings.features.communication_center_enabled
        return broadcast(:feature_disabled, delivery) unless rollout_active?
        return broadcast(:already_terminal, delivery) if delivery.cancelled? || delivery.completed?
        return broadcast(:unsupported_kind, delivery) unless CommunicationTemplate::DELIVERABLE_KINDS.include?(delivery.kind)

        occurrence_key = claim_occurrence
        return broadcast(:not_due, delivery) unless occurrence_key

        result = Communications::Deliveries::ResolveAudience.call(delivery)
        return fail_delivery! if result.key?(:unsupported_recipients)

        result[:ok].find_each { |campaign_user| create_email(campaign_user, occurrence_key) }

        delivery.update!(last_ran_at: Time.current)
        broadcast(:ok, delivery)
      end

      private

      attr_reader :delivery

      # Client-level "use only the new center" flag -- mirrors CommunicationEmail#ensure_legacy_not_suppressed's
      # legacy-side guard so a client with the flag off never gets a scheduled/reminder delivery dispatched
      # alongside its still-sending legacy Communication rows.
      def rollout_active?
        delivery.client&.feature_enabled?(:use_new_communication_center) || false
      end

      def one_shot?
        %w[send_now specific_datetime].include?(delivery.delivery_rule)
      end

      # Returns the occurrence identifier for the run just claimed, or false if nothing was due.
      # The identifier is what the (delivery, user, occurrence_key) unique index dedups recipients on.
      def claim_occurrence
        if one_shot?
          claimed = CommunicationDelivery.where(id: delivery.id, last_ran_at: nil).
                    update_all(last_ran_at: Time.current) == 1
          claimed ? 'once' : false
        elsif delivery.kind == 'assessment_center_booking_summary'
          claim_booking_summary_occurrence
        else
          occurrence_time = delivery.next_run_at || Time.current
          claimed = CommunicationDelivery.where(id: delivery.id).
                    where('next_run_at IS NULL OR next_run_at <= ?', Time.current).
                    update_all(next_run_at: Time.current + interval_duration) == 1
          claimed ? occurrence_time.utc.iso8601 : false
        end
      end

      def claim_booking_summary_occurrence
        next_date = Communications::Deliveries::RecurringScheduling.
                    next_scheduled_date(delivery, last_run_date: booking_summary_last_run_date)
        return false unless next_date

        run_at = Communications::Deliveries::RecurringScheduling.run_at_for(delivery, next_date)
        claimed = CommunicationDelivery.where(id: delivery.id).
                  where('next_run_at IS NULL OR next_run_at <= ?', Time.current).
                  update_all(next_run_at: run_at) == 1
        claimed ? next_date.iso8601 : false
      end

      def booking_summary_last_run_date
        delivery.last_ran_at&.in_time_zone(delivery.delivery_timezone)&.to_date
      end

      def interval_duration
        return 1.day unless VALID_INTERVAL_PERIODS.include?(delivery.delivery_interval_period.to_s)

        delivery.delivery_interval_number.to_i.public_send(delivery.delivery_interval_period)
      end

      def create_email(campaign_user, occurrence_key)
        CommunicationEmail.create!(communication_delivery: delivery, campaign_user: campaign_user,
                                   user: campaign_user.user, occurrence_key: occurrence_key)
      rescue ActiveRecord::RecordNotUnique
        nil
      end

      def fail_delivery!
        delivery.update!(status: :failed)
        broadcast(:unsupported_recipients, delivery)
      end
    end
  end
end
