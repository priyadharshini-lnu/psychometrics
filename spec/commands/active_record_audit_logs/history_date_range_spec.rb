# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveRecordAuditLogs::HistoryDateRange do
  describe '.resolve' do
    it 'defaults to the last 7 days when nothing is provided' do
      range = described_class.resolve(nil, nil)

      expect(range.begin).to be_within(1.second).of(described_class::DEFAULT_DAYS.days.ago)
      expect(range.end).to be_within(1.second).of(Time.current)
    end

    it 'defaults the start to 7 days before a provided end' do
      end_time = 2.days.ago
      range = described_class.resolve(nil, end_time.iso8601)

      expect(range.begin).to be_within(1.second).of(end_time - described_class::DEFAULT_DAYS.days)
    end

    it 'returns the explicit bounds when both are within the maximum span' do
      start_time = 5.days.ago
      end_time = 1.day.ago
      range = described_class.resolve(start_time.iso8601, end_time.iso8601)

      expect(range.begin).to be_within(1.second).of(start_time)
      expect(range.end).to be_within(1.second).of(end_time)
    end

    it 'raises when the range exceeds the maximum span' do
      expect { described_class.resolve(60.days.ago.iso8601, Time.current.iso8601) }.
        to raise_error(described_class::Error, /cannot exceed/)
    end

    it 'raises when the end precedes the start' do
      expect { described_class.resolve(Time.current.iso8601, 2.days.ago.iso8601) }.
        to raise_error(described_class::Error, /on or after the start date/)
    end
  end
end
