# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::GetTotalEvaluations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_evaluators) { create_list(:threesixty_evaluator, 2, campaign: threesixty_campaign.campaign) }

  it 'returns total evaluations count' do
    create(:threesixty_option, threesixty_campaign: threesixty_campaign)
    threesixty_evaluators.each do |threesixty_evaluator|
      create(
        :participant,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        subject_id: create(:user).id
      )
    end
    create(
      :participant,
      campaign: threesixty_campaign.campaign,
      evaluator_id: threesixty_evaluators[0].user_id,
      subject_id: create(:user).id
    )

    results = described_class.call!(threesixty_campaign, threesixty_evaluators.map(&:user_id))

    expect(results[threesixty_evaluators[0].user_id].total_evaluations_count).to eq(2)
    expect(results[threesixty_evaluators[1].user_id].total_evaluations_count).to eq(1)
  end

  it "excludes nominations which are not approved by manager" do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: { 'manager' => { 'can_approve_nominations' => true } }
    )
    threesixty_evaluators.each do |threesixty_evaluator|
      create(
        :participant,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        subject_id: create(:user).id,
        manager_nomination_status: :approved
      )
    end
    create(
      :participant,
      campaign: threesixty_campaign.campaign,
      evaluator_id: threesixty_evaluators[0].user_id,
      subject_id: create(:user).id,
      manager_nomination_status: :waiting
    )

    results = described_class.call!(threesixty_campaign, threesixty_evaluators.map(&:user_id))

    expect(results[threesixty_evaluators[0].user_id].total_evaluations_count).to eq(1)
    expect(results[threesixty_evaluators[1].user_id].total_evaluations_count).to eq(1)
  end
end
