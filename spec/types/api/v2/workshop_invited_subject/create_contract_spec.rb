# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::WorkshopInvitedSubject::CreateContract do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
  let(:workshop_invite) { create(:workshop_invite, campaign: campaign, campaign_assessment_group: assessment_group) }
  let(:valid_params) do
    jsonapi_resource_request(
      'workshop_invited_subjects',
      {},
      { user: { id: user.id.to_s, type: 'users' },
        workshop_invite: { id: workshop_invite.id.to_s, type: 'workshop_invites' } }
    )
  end

  it 'validates if subject is not already present' do
    create(:workshop_invited_subject, user: user, workshop_invite: workshop_invite)
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_relationship_error(
      user: { id: ["Subject is already invited to '#{workshop_invite.title}'.",
                   'Subject already exists in the invite.'] }
    )
  end

  it 'validates if subject is already invited to same assessment group' do
    other_workshop_invite = create(:workshop_invite,
                                   campaign: campaign,
                                   campaign_assessment_group: assessment_group,
                                   title: 'Other Workshop Invite')

    create(:workshop_invited_subject, user: user, workshop_invite: other_workshop_invite)

    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_relationship_error(
      user: { id: ["Subject is already invited to 'Other Workshop Invite'."] }
    )
  end

  it 'passes if subject is not present' do
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(false)
  end
end
