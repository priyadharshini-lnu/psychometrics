# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::GetManagers do
  before do
    threesixty_campaign = create(:threesixty_campaign)
    @subject = create(:threesixty_subject, campaign_id: threesixty_campaign.campaign_id)
    manager_relationship = create(:relationship, name: 'Manager')
    @manager_evaluators = create_list(:threesixty_evaluator, 2, campaign_id: threesixty_campaign.campaign_id)
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      evaluator: @manager_evaluators[0].user
    )
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      evaluator: @manager_evaluators[1].user
    )

    # Subjects manager in different campaign
    manager_evaluator_different_campaign = create(:threesixty_evaluator, campaign: create(:campaign))
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      evaluator: manager_evaluator_different_campaign.user
    )

    # Subjects Peer
    peer_relationship = create(:relationship, name: 'Peer')
    peer_evaluator = create(:threesixty_evaluator, campaign_id: threesixty_campaign.campaign_id)
    create(
      :threesixty_participant,
      subject_id: @subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: peer_relationship,
      evaluator: peer_evaluator.user
    )
  end

  it 'gets all managers for a subject from the same campaign' do
    actual_managers = described_class.new(subject: @subject).to_a

    expect(actual_managers.length).to eq(2)
    expect(actual_managers).to match_array(@manager_evaluators)
  end
end
