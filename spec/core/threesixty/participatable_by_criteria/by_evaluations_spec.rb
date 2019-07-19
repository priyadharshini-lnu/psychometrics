# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::ByEvaluations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: { 'subject' => { 'can_evaluate_self' => true } }
    )
  end
  let(:threesixty_subjects) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }

  it 'returns participatables who have completed all the evaluations' do
    threesixty_subjects.each do |threesixty_subject|
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id
      )
    end

    threesixty_subjects[0..1].each do |threesixty_subject|
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        status: :completed
      )
    end

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end

  it "returns participatables who had not completed all evaluations" do
    threesixty_subjects.each do |threesixty_subject|
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id
      )
    end

    create(
      :users_result,
      campaign: threesixty_campaign.campaign,
      subject_id: threesixty_subjects[0].user_id,
      evaluator_id: threesixty_subjects[0].user_id,
      status: :completed
    )

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'not_completed' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[1..2])
  end

  it "returns participatables who have completed all evaluations but are waiting for approval" do
    threesixty_subjects[0..1].each do |threesixty_subject|
      create(
        :participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        manager_evaluation_status: :waiting
      )

      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_subject.user_id,
        status: :completed
      )
    end

    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      subject_id: threesixty_subjects[2].user_id,
      evaluator_id: threesixty_subjects[2].user_id,
      manager_evaluation_status: :approved
    )
    create(
      :users_result,
      campaign: threesixty_campaign.campaign,
      subject_id: threesixty_subjects[2].user_id,
      evaluator_id: threesixty_subjects[2].user_id,
      status: :completed
    )

    criteria_list = [{ 'field' => 'evaluations', 'value' => 'needs_approval' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end
end
