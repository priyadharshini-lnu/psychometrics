# frozen_string_literal: true

module Communications
  module Deliveries
    class DispatchJob < ApplicationJob
      queue_as :communication

      VALID_INTERVAL_PERIODS = %w[hours days weeks months].freeze

      retry_on StandardError, wait: ->(executions) { executions * 1.minute }, attempts: 3

      def perform(delivery_id)
        delivery = CommunicationDelivery.find_by(id: delivery_id)
        return if delivery.nil? || delivery.cancelled?

        result = Communications::Deliveries::Dispatch.call(delivery)
        return unless result[:ok]

        finalize_or_reschedule(delivery.reload)
      end

      private

      def finalize_or_reschedule(delivery)
        return if delivery.cancelled?

        if delivery.kind == 'assessment_center_booking_summary'
          reschedule_booking_summary(delivery)
        elsif one_shot?(delivery) || reminder_window_closed?(delivery)
          delivery.update!(status: :completed)
        else
          self.class.set(wait: interval_duration(delivery)).perform_later(delivery.id)
        end
      end

      def reschedule_booking_summary(delivery)
        last_run_date = delivery.last_ran_at&.in_time_zone(delivery.delivery_timezone)&.to_date
        next_date = Communications::Deliveries::RecurringScheduling.
                    next_scheduled_date(delivery, last_run_date: last_run_date)
        return delivery.update!(status: :completed) unless next_date

        run_at = Communications::Deliveries::RecurringScheduling.run_at_for(delivery, next_date)
        self.class.set(wait_until: run_at).perform_later(delivery.id)
      end

      def one_shot?(delivery)
        %w[send_now specific_datetime].include?(delivery.delivery_rule)
      end

      def reminder_window_closed?(delivery)
        delivery.stop_reminder_datetime.present? && delivery.stop_reminder_datetime <= Time.current
      end

      def interval_duration(delivery)
        period = delivery.delivery_interval_period.to_s
        period = 'days' unless VALID_INTERVAL_PERIODS.include?(period)
        (delivery.delivery_interval_number || 1).to_i.public_send(period)
      end
    end
  end
end
