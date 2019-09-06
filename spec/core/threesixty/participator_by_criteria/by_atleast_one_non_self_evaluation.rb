# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByAtleastOneNonSelfEvaluation do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: { 'subject' => { 'can_evaluate_self' => true } }
    )
  end
  let(:threesixty_evaluators) { create_list(:threesixty_subject, 3, campaign: threesixty_campaign.campaign) }

  it 'returns evaluators that have atleast one non self evaluation' do
    threesixty_evaluators[0..1].each do |threesixty_evaluator|
      create(
        :threesixty_participant,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        subject_id: create(:user).id
      )
    end
    create(
      :threesixty_participant,
      campaign: threesixty_campaign.campaign,
      evaluator_id: threesixty_evaluators[2].user_id,
      subject_id: threesixty_evaluators[2].user_id
    )

    criteria_list = [{ 'field' => 'atleast_one_non_self_evalaution' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_evaluators,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_evaluators[0..1])
  end
end

