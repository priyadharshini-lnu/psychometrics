# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::RecurringScheduling do
  def build_delivery(schedule)
    Struct.new(:delivery_frequency, :delivery_start_date, :delivery_end_date, :delivery_weekdays,
               :delivery_timezone, :delivery_time_of_day).new(
                 schedule[:frequency],
                 schedule[:start_date],
                 schedule[:end_date],
                 schedule[:weekdays],
                 schedule.fetch(:timezone, 'UTC'),
                 Time.zone.parse(schedule.fetch(:time_of_day, '09:00'))
               )
  end

  describe '.next_scheduled_date' do
    context 'daily frequency' do
      it 'returns the start date on the first run' do
        delivery = build_delivery(frequency: 'daily', start_date: Date.new(2026, 8, 1), end_date: Date.new(2026, 8, 10))

        expect(described_class.next_scheduled_date(delivery)).to eq(Date.new(2026, 8, 1))
      end

      it 'returns the day after the last run date' do
        delivery = build_delivery(frequency: 'daily', start_date: Date.new(2026, 8, 1), end_date: Date.new(2026, 8, 10))

        expect(described_class.next_scheduled_date(delivery,
                                                   last_run_date: Date.new(2026, 8, 3))).to eq(Date.new(2026, 8, 4))
      end

      it 'returns nil once the end date has passed' do
        delivery = build_delivery(frequency: 'daily', start_date: Date.new(2026, 8, 1), end_date: Date.new(2026, 8, 10))

        expect(described_class.next_scheduled_date(delivery, last_run_date: Date.new(2026, 8, 10))).to be_nil
      end
    end

    context 'weekly frequency' do
      it 'locks to the weekday of the start date' do
        start_date = Date.new(2026, 8, 3) # Monday
        delivery = build_delivery(frequency: 'weekly', start_date: start_date, end_date: start_date + 3.weeks)

        expect(described_class.next_scheduled_date(delivery, last_run_date: start_date)).to eq(start_date + 1.week)
      end
    end

    context 'specific_weekdays frequency' do
      it 'only schedules on the configured weekdays, matched case-insensitively against abbreviated day names' do
        start_date = Date.new(2026, 8, 3) # Monday
        delivery = build_delivery(frequency: 'specific_weekdays', start_date: start_date,
                                  end_date: start_date + 2.weeks, weekdays: %w[Wed Fri])

        expect(described_class.next_scheduled_date(delivery)).to eq(Date.new(2026, 8, 5)) # Wednesday
        friday = described_class.next_scheduled_date(delivery, last_run_date: Date.new(2026, 8, 5))
        expect(friday).to eq(Date.new(2026, 8, 7))
      end
    end

    it 'returns nil when start or end date is missing' do
      delivery = build_delivery(frequency: 'daily', start_date: nil, end_date: Date.current)

      expect(described_class.next_scheduled_date(delivery)).to be_nil
    end

    it 'raises for an unknown frequency once no scheduled date remains to try' do
      delivery = build_delivery(frequency: 'monthly', start_date: Date.new(2026, 8, 1), end_date: Date.new(2026, 8, 10))

      expect do
        described_class.next_scheduled_date(delivery)
      end.to raise_error(ArgumentError, /Unknown delivery_frequency/)
    end
  end

  describe '.run_at_for' do
    it 'combines the date with the configured time of day in the delivery timezone' do
      delivery = build_delivery(frequency: 'daily', start_date: Date.new(2026, 8, 1), end_date: Date.new(2026, 8, 10),
                                timezone: 'Asia/Dubai', time_of_day: '14:30')

      run_at = described_class.run_at_for(delivery, Date.new(2026, 8, 5))

      expect(run_at).to eq(ActiveSupport::TimeZone['Asia/Dubai'].local(2026, 8, 5, 14, 30))
    end
  end
end
