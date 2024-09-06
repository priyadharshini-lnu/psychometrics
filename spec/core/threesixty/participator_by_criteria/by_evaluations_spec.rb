# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByEvaluations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: { 'subject' => { 'can_evaluate_self' => true } }
    )
  end
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }

  it 'returns participators who have completed all the evaluations' do
    threesixty_subjects.each.with_index do |threesixty_subject, index|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        status: index <= 1 ? :completed : :in_progress,
        score_calculated: index <= 1
      )
    end

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end

  it 'returns participators who had not completed all evaluations' do
    threesixty_subjects.each.with_index do |threesixty_subject, index|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        status: index == 0 ? :completed : :in_progress,
        score_calculated: index <= 1
      )
    end

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'not_completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[1..2])
  end

  it 'returns participators who have completed all evaluations but are waiting for approval' do
    threesixty_subjects[0..1].each do |threesixty_subject|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        manager_evaluation_status: :waiting,
        status: :completed,
        score_calculated: true
      )
    end

    create(
      :threesixty_participant,
      campaign_id: threesixty_campaign.campaign_id,
      subject_id: threesixty_subjects[2].user_id,
      evaluator_id: threesixty_subjects[2].user_id,
      manager_evaluation_status: :approved,
      status: :completed,
      score_calculated: true
    )

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'needs_approval' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end
end
