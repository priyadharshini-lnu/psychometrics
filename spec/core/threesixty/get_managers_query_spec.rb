# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::GetManagersQuery do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:campaign) { threesixty_campaign.campaign }

  it 'gets managers from current campaign' do
    threesixty_evaluators = create_list(:threesixty_evaluator, 2, campaign_id: campaign.id)
    manager_relationship = create(:relationship, name: 'Manager', type: :global)
    peer_relationship = create(:relationship, name: 'Peer', type: :global)
    create(
      :threesixty_participant,
      evaluator_id: threesixty_evaluators[0].user_id,
      relationship_id: manager_relationship.id,
      campaign_id: campaign.id
    )

    create(
      :threesixty_participant,
      evaluator_id: threesixty_evaluators[1].user_id,
      relationship_id: peer_relationship.id,
      campaign_id: campaign.id
    )

    results = described_class.new(threesixty_campaign).query

    expect(results).to match_array([threesixty_evaluators[0]])
  end

  it 'ignores user which is manager in other campaign but a evluator with normal relationship in current campaign' do
    other_threesixty_campaign = create(:threesixty_campaign)
    threesixty_evaluator = create(:threesixty_evaluator, campaign_id: campaign.id)
    threesixty_evaluator_in_other_campaign = create(
      :threesixty_evaluator,
      campaign_id: other_threesixty_campaign.campaign_id,
      user_id: threesixty_evaluator.user_id
    )

    manager_relationship = create(:relationship, name: 'Manager', type: :global)
    peer_relationship = create(:relationship, name: 'Peer', type: :global)

    create(
      :threesixty_participant,
      evaluator_id: threesixty_evaluator.user_id,
      relationship_id: peer_relationship.id,
      campaign_id: campaign.id
    )
    create(
      :threesixty_participant,
      evaluator_id: threesixty_evaluator_in_other_campaign.user_id,
      relationship_id: manager_relationship.id,
      campaign_id: other_threesixty_campaign.campaign_id
    )

    results = described_class.new(threesixty_campaign).query

    expect(results).to be_blank
  end
end
