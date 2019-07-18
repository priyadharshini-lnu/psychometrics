# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::ByEvaluatorType do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_evaluators) { create_list(:threesixty_evaluator, 3, campaign: threesixty_campaign.campaign) }

  context 'external evaluator criteria' do
    it 'returns evaluators who are not a subject inside a campaign' do
      create(:threesixty_subject, campaign: threesixty_campaign.campaign, user_id: threesixty_evaluators[0].user_id)

      criteria_list = [{ 'field' => 'evaluator_type', 'value' => 'external' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_evaluators,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_evaluators[1..2])
    end
  end

  context 'not external evaluator criteria' do
    it 'returns evaluators who are a subject inside a campaign' do
      threesixty_evaluators[0..1].each do |threesixty_evaluator|
        create(:threesixty_subject, campaign: threesixty_campaign.campaign, user_id: threesixty_evaluator.user_id)
      end

      criteria_list = [{ 'field' => 'evaluator_type', 'value' => 'not_external' }]
      results = described_class.call!(
        threesixty_campaign: threesixty_campaign,
        participatables: threesixty_evaluators,
        criteria_list: criteria_list
      )

      expect(results).to match_array(threesixty_evaluators[0..1])
    end
  end
end
