# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::IsReportAvailable do
  let(:threesixty_subject) { build(:threesixty_subject) }
  let(:option) { build(:threesixty_option) }
  let(:subject_evaluator_counters) { {} }

  it 'returns true if report is available' do
    allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
      with(threesixty_subject, option, subject_evaluator_counters).
      and_return(Threesixty::Participants::GetReportStatus::RELEASED)

    result = described_class.call!(threesixty_subject, option, subject_evaluator_counters)

    expect(result).to eq true
  end

  it 'returns false if report is not available' do
    allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
      with(threesixty_subject, option, subject_evaluator_counters).
      and_return(Threesixty::Participants::GetReportStatus::ON_HOLD)

    result = described_class.call!(threesixty_subject, option, subject_evaluator_counters)

    expect(result).to eq false
  end
end
