# frozen_string_literal: true

require 'rails_helper'

describe Reports::CompletedAtDates do
  describe '.call' do
    it 'returns nil when there are no results' do
      expect(described_class.call!([])).to be_nil
    end

    it 'returns nil when none of the results have completed' do
      results = [double('result', completed_at: nil)]

      expect(described_class.call!(results)).to be_nil
    end

    it 'returns the same date twice when all results completed on the same day' do
      completed_at = Time.zone.now
      results = [double('result', completed_at: completed_at), double('result', completed_at: completed_at)]

      expect(described_class.call!(results)).to eq([completed_at.to_date, completed_at.to_date])
    end

    it 'returns the earliest and latest dates when results completed on different days' do
      earlier = 3.days.ago
      later = Time.zone.now
      results = [double('result', completed_at: later), double('result', completed_at: earlier)]

      expect(described_class.call!(results)).to eq([earlier.to_date, later.to_date])
    end
  end
end
