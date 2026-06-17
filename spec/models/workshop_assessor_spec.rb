# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopAssessor, type: :model do
  let(:tenancy) { create(:tenancy) }
  let(:project) { create(:client, parent: tenancy) }
  let(:campaign) { create(:campaign, project: project) }
  let(:workshop) { create(:workshop, campaign: campaign) }
  let(:user) { create(:user, project: nil) }

  it 'creates a client_assessor membership on create' do
    expect do
      create(:workshop_assessor, workshop: workshop, user: user)
    end.to change {
      Membership.where(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    }.from(0).to(1)
  end

  it 'keeps the client_assessor membership after destroy when another workshop assessor remains in the client' do
    create(:workshop_assessor, workshop: workshop, user: user)
    other_workshop = create(:workshop, campaign: campaign)
    workshop_assessor = create(:workshop_assessor, workshop: other_workshop, user: user)

    expect do
      workshop_assessor.destroy!
    end.not_to(change do
      Membership.where(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    end)
  end

  it 'keeps the client_assessor membership after destroy when another assessor remains in the client' do
    workshop_assessor = create(:workshop_assessor, workshop: workshop, user: user)
    create(:assessor, user: user, campaign: create(:campaign, project: project))

    expect do
      workshop_assessor.destroy!
    end.not_to(change do
      Membership.where(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    end)
  end
end
