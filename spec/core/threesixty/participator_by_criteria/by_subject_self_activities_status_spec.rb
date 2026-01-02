# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::BySubjectSelfActivitiesStatus do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subjects) { create_list(:threesixty_subject, 4) }

  it 'returns subject matching criteria status' do
    allow_any_instance_of(described_class).to receive(:valid_nomination_requirement?).
      with(threesixty_subjects[0]).and_return(true)
    allow_any_instance_of(described_class).to receive(:all_evaluations_completed_by_subject?).
      with(threesixty_subjects[0]).and_return(true)

    allow_any_instance_of(described_class).to receive(:valid_nomination_requirement?).
      with(threesixty_subjects[1]).and_return(false)
    allow_any_instance_of(described_class).to receive(:all_evaluations_completed_by_subject?).
      with(threesixty_subjects[1]).and_return(true)

    allow_any_instance_of(described_class).to receive(:valid_nomination_requirement?).
      with(threesixty_subjects[2]).and_return(true)
    allow_any_instance_of(described_class).to receive(:all_evaluations_completed_by_subject?).
      with(threesixty_subjects[2]).and_return(false)

    allow_any_instance_of(described_class).to receive(:valid_nomination_requirement?).
      with(threesixty_subjects[3]).and_return(false)
    allow_any_instance_of(described_class).to receive(:all_evaluations_completed_by_subject?).
      with(threesixty_subjects[3]).and_return(false)

    criteria_list = [{ 'field' => 'subject_self_activities_status', 'value' => 'not_completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )
    expect(results).to match_array([threesixty_subjects[1], threesixty_subjects[2], threesixty_subjects[3]])

    criteria_list = [{ 'field' => 'subject_self_activities_status', 'value' => 'completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )
    expect(results).to match_array([threesixty_subjects[0]])
  end
end
