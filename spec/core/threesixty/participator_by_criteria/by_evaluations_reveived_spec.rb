# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByEvaluationsReceived do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: {
        'subject' => { 'can_evaluate_self' => true },
        'manager' => { 'can_approves_evaluations' => true }
      }
    )
  end
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }
  let(:threesixty_evaluator) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }

  before do
    threesixty_subjects[0..1].each do |threesixty_subject|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        manager_evaluation_status: :approved
      )
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_evaluator.user_id,
        manager_evaluation_status: :approved
      )
    end

    create(
      :threesixty_participant,
      campaign_id: threesixty_campaign.campaign_id,
      subject_id: threesixty_subjects[2].user_id,
      evaluator_id: threesixty_evaluator.user_id,
      manager_evaluation_status: :approved
    )
  end

  it 'returns participators who have received evaluation which is equal to the criteria value' do
    criteria_list = [{ 'field' => 'evaluations_received', 'comparator' => 'equal', 'value' => '2' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end

  it 'returns participators who have received evaluation which is less than to the criteria value' do
    criteria_list = [{ 'field' => 'evaluations_received', 'comparator' => 'less_than', 'value' => '2' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array([threesixty_subjects[2]])
  end

  it 'returns participators who have received evaluation which is more than than to the criteria value' do
    criteria_list = [{ 'field' => 'evaluations_received', 'comparator' => 'more_than', 'value' => '1' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end

  it 'returns participators who have received evaluation which is not equal to the criteria value' do
    criteria_list = [{ 'field' => 'evaluations_received', 'comparator' => 'not_equal', 'value' => '1' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end
end
