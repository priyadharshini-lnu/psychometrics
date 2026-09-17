# frozen_string_literal: true

module Communications
  module Deliveries
    # Date-based scheduling for assessment_center_booking_summary deliveries, ported from
    # app/models/concerns/recurring_scheduling.rb (which serves the legacy Communication model).
    module RecurringScheduling
      module_function

      def next_scheduled_date(delivery, last_run_date: nil)
        return nil unless delivery.delivery_start_date && delivery.delivery_end_date

        date = last_run_date ? increment_date(delivery, last_run_date) : delivery.delivery_start_date
        date = increment_date(delivery, date) while date <= delivery.delivery_end_date && !should_schedule_on?(
          delivery, date
        )
        date if date <= delivery.delivery_end_date
      end

      def run_at_for(delivery, date)
        tz = ActiveSupport::TimeZone[delivery.delivery_timezone]
        tz.local(date.year, date.month, date.day, delivery.delivery_time_of_day.hour, delivery.delivery_time_of_day.min)
      end

      def should_schedule_on?(delivery, date)
        case delivery.delivery_frequency
          when 'daily' then true
          when 'weekly' then date.wday == delivery.delivery_start_date.wday
          when 'specific_weekdays'
            delivery.delivery_weekdays.to_a.map(&:downcase).include?(date.strftime('%a').downcase)
          else false
        end
      end

      def increment_date(delivery, date)
        case delivery.delivery_frequency
          when 'daily', 'specific_weekdays' then date + 1.day
          when 'weekly' then date + 1.week
          else raise ArgumentError, "Unknown delivery_frequency: #{delivery.delivery_frequency.inspect}"
        end
      end
    end
  end
end
