# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::IsNominationRequirementComplete do
  let!(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

  it 'returns true if there are no matching nomination criteria' do
    result = described_class.call!(threesixty_campaign, threesixty_subject.user)

    expect(result).to eq(true)
  end

  it 'returns true if nomination requirements are meet for subject' do
    manager_relationship = create(:relationship, name: 'Manager')
    create(
      :threesixty_nomination_requirement,
      threesixty_campaign: threesixty_campaign,
      conditions: [{ 'value' => 1, 'comparator' => 'equal', 'relationship_id' => manager_relationship.id }]
    )
    create(
      :participant,
      subject_id: threesixty_subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship
    )

    result = described_class.call!(threesixty_campaign, threesixty_subject.user)

    expect(result).to eq(true)
  end

  it 'returns false if nomination requirements are not meet for subject' do
    manager_relationship = create(:relationship, name: 'Manager')
    create(
      :threesixty_nomination_requirement,
      threesixty_campaign: threesixty_campaign,
      conditions: [{ 'value' => 2, 'comparator' => 'equal', 'relationship_id' => manager_relationship.id }]
    )
    create(
      :participant,
      subject_id: threesixty_subject.user_id,
      campaign_id: threesixty_campaign.campaign_id,
      relationship: manager_relationship,
    )

    result = described_class.call!(threesixty_campaign, threesixty_subject.user)

    expect(result).to eq(false)
  end
end
