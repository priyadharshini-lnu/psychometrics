# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::GetCompletedEvaluations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_evaluators) { create_list(:threesixty_evaluator, 2, campaign: threesixty_campaign.campaign) }

  it 'gets completed_evaluations_count for participants' do
    threesixty_evaluators.each do |threesixty_evaluator|
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        status: :completed
      )
    end
    create(
      :users_result,
      campaign: threesixty_campaign.campaign,
      evaluator_id: threesixty_evaluators[0].user_id,
      status: :completed
    )

    results = described_class.call!(threesixty_campaign, threesixty_evaluators.map(&:user_id))

    expect(results[threesixty_evaluators[0].user_id].completed_evaluations_count).to eq(2)
    expect(results[threesixty_evaluators[1].user_id].completed_evaluations_count).to eq(1)
  end

  it 'ignores self evaluation count when exclude_self_evaluations is set' do
    threesixty_evaluators.each do |threesixty_evaluator|
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        status: :completed
      )
    end
    create(
      :users_result,
      campaign: threesixty_campaign.campaign,
      evaluator_id: threesixty_evaluators[0].user_id,
      subject_id: threesixty_evaluators[0].user_id,
      status: :completed
    )

    results = described_class.call!(
      threesixty_campaign,
      threesixty_evaluators.map(&:user_id),
      exclude_self_evaluations: true
    )

    threesixty_evaluators.each do |threesixty_evaluator|
      expect(results[threesixty_evaluator.user_id].completed_evaluations_count).to eq(1)
    end
  end
end
