# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessor, type: :model do
  let(:assessor) { create(:assessor) }
  let(:campaign) { assessor.campaign }
  let(:client) { campaign.project.client }

  it 'removes the client_assessor membership after destroy when no assessor assignment remains in the client' do
    membership = create(:membership, user: assessor.user, client: client,
      role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil)

    expect do
      assessor.destroy!
    end.to change {
      Membership.where(user: assessor.user, client: client,
                       role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    }.from(1).to(0)

    expect(Membership.find_by(id: membership.id)).to be_nil
  end

  it 'keeps the client_assessor membership after destroy when another assessor assignment remains in the client' do
    create(:membership, user: assessor.user, client: client,
      role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil)
    other_campaign = create(:campaign, project: campaign.project)
    create(:assessor, user: assessor.user, campaign: other_campaign)

    expect do
      assessor.destroy!
    end.not_to(change do
      Membership.where(user: assessor.user, client: client,
                       role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    end)
  end

  it 'keeps the client_assessor membership after destroy when a workshop assessor remains in the client' do
    create(:membership, user: assessor.user, client: client,
      role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil)
    create(:workshop_assessor, user: assessor.user, workshop: create(:workshop, campaign: campaign))

    expect do
      assessor.destroy!
    end.not_to(change do
      Membership.where(user: assessor.user, client: client,
                       role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    end)
  end
end
