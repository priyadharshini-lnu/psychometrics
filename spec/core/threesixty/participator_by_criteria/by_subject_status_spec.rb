# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::BySubjectStatus do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 2) }

  before do
    @counter = {}
    @subject_evaluator_counters = {}
    @nomination_requirement_by_user_id = {}

    allow_any_instance_of(described_class).to receive(:counters).and_return(@counter)
    allow_any_instance_of(described_class).to receive(:subject_evaluator_counters).and_return(@subject_evaluator_counters)
    allow_any_instance_of(described_class).to receive(:nomination_requirement_by_user_id).and_return(@nomination_requirement_by_user_id)
  end

  it 'returns subject matching criteria status' do
    allow(Threesixty::Participants::GetStatus).to receive(:call!).
      with(
        threesixty_subjects[0],
        nil,
        nil,
        nil
      ).and_return(Threesixty::Participants::GetStatus::COMPLETED)
    allow(Threesixty::Participants::GetStatus).to receive(:call!).
      with(
        threesixty_subjects[1],
        nil,
        nil,
        nil
      ).and_return(Threesixty::Participants::GetStatus::NOT_COMPLETED)

    criteria_list = [{ 'field' => 'subject_status', 'value' => Threesixty::Participants::GetStatus::COMPLETED }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array([threesixty_subjects[0]])
  end
end
