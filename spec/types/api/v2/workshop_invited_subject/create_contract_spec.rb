# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::WorkshopInvitedSubject::CreateContract do
  let(:user) { create(:user) }
  let(:workshop_invite) { create(:workshop_invite) }
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
      user: { id: ['Subject already exists in the invite.'] }
    )
  end

  it 'passes if subject is not present' do
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(false)
  end
end
