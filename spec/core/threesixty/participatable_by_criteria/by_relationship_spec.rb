# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatableByCriteria::ByRelationship do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(
      :threesixty_option,
      threesixty_campaign: threesixty_campaign,
      participants: { 'subject' => { 'can_evaluate_self' => true } }
    )
  end

  it 'returns subjects matching relationship' do
    threesixty_subjects = create_list(:threesixty_subject, 3)
    manager_relationship = create(:relationship, name: 'Manager')
    peer_relationship = create(:relationship, name: 'Peer')
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      subject: threesixty_subjects[0].user
    )
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      subject: threesixty_subjects[1].user
    )
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: peer_relationship,
      subject: threesixty_subjects[2].user
    )

    criteria_list = [{ 'field' => 'relationship', 'value' => manager_relationship.id }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_subjects,
      criteria_list: criteria_list,
      participatable_type: :subject
    )

    expect(results).to match_array(threesixty_subjects[0..1])
  end

  it 'returns evaluators matching relationship' do
    threesixty_evaluators = create_list(:threesixty_evaluator, 3)
    manager_relationship = create(:relationship, name: 'Manager')
    peer_relationship = create(:relationship, name: 'Peer')
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      evaluator: threesixty_evaluators[0].user
    )
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
      evaluator: threesixty_evaluators[1].user
    )
    create(
      :participant,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: peer_relationship,
      evaluator: threesixty_evaluators[2].user
    )

    criteria_list = [{ 'field' => 'relationship', 'value' => manager_relationship.id }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participatables: threesixty_evaluators,
      criteria_list: criteria_list,
      participatable_type: :evaluator
    )

    expect(results).to match_array(threesixty_evaluators[0..1])
  end
end
