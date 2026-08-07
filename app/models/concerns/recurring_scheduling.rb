# frozen_string_literal: true

module RecurringScheduling
  extend ActiveSupport::Concern

  def schedule_repeated_emails(job:, last_run_date: nil)
    normalized_tz = TimezoneHelper.normalize(delivery_timezone)
    tz = ActiveSupport::TimeZone[normalized_tz]
    return unless tz && delivery_start_date && delivery_end_date && delivery_time_of_day

    next_date = next_scheduled_date(last_run_date)
    return unless next_date && next_date <= delivery_end_date

    run_at = tz.local(next_date.year, next_date.month, next_date.day, delivery_time_of_day.hour,
                      delivery_time_of_day.min)
    job.set(wait_until: run_at).perform_later(id)
  end

  def next_scheduled_date(last_run_date = nil)
    date = last_run_date ? increment_date(last_run_date) : delivery_start_date
    while date <= delivery_end_date
      return date if should_schedule_on?(date)

      date = increment_date(date)
    end
    nil
  end

  private

  def should_schedule_on?(date)
    case delivery_frequency
      when 'daily'
        true
      when 'weekly'
        # Once per week on the same weekday as start_date
        date.wday == delivery_start_date.wday
      when 'specific_weekdays'
        delivery_weekdays.map(&:downcase).include?(date.strftime('%a').downcase)
      else
        false
    end
  end

  def increment_date(date)
    case delivery_frequency
      when 'daily', 'specific_weekdays'
        date + 1.day
      when 'weekly'
        date + 1.week
      else
        raise ArgumentError, "Unknown delivery_frequency: #{delivery_frequency.inspect}"
    end
  end
end
