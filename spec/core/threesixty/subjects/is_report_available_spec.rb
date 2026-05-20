# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::IsReportAvailable do
  let(:threesixty_subject) { build(:threesixty_subject) }
  let(:option) { build(:threesixty_option) }
  let(:subject_evaluator_counters) { {} }

  context 'when report is available' do
    before do
      allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
        with(threesixty_subject, option, subject_evaluator_counters).
        and_return(Threesixty::Participants::GetReportStatus::RELEASED)
    end

    it 'returns available: true with no status message' do
      result = described_class.call!(threesixty_subject, option, subject_evaluator_counters)

      expect(result).to include(available: true, status_message: nil)
    end
  end

  context 'when report is not available' do
    before do
      allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
        with(threesixty_subject, option, subject_evaluator_counters).
        and_return(Threesixty::Participants::GetReportStatus::ON_HOLD)

      allow(Threesixty::Subjects::GetReportStatusMessage).to receive(:call!).
        with(
          threesixty_subject,
          Threesixty::Participants::GetReportStatus::ON_HOLD,
          option,
          subject_evaluator_counters
        ).
        and_return({ status_message: 'Report is on hold' })
    end

    it 'returns available: false with status message' do
      result = described_class.call!(threesixty_subject, option, subject_evaluator_counters)

      expect(result).to include(available: false, status_message: 'Report is on hold')
    end
  end

  context 'when report is not available but evaluation is completed' do
    before do
      allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
        with(threesixty_subject, option, subject_evaluator_counters).
        and_return(Threesixty::Participants::GetReportStatus::ON_HOLD)

      allow(threesixty_subject).to receive(:evaluation_status_completed?).and_return(true)
    end

    it 'returns available: true' do
      result = described_class.call!(threesixty_subject, option, subject_evaluator_counters)

      expect(result).to include(available: true, status_message: nil)
    end
  end
end
