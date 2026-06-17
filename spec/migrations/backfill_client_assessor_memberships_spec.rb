# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('db/migrate/20260615195000_backfill_client_assessor_memberships')

RSpec.describe BackfillClientAssessorMemberships, type: :migration do
  let(:migration) { described_class.new }
  let(:tenancy) { create(:tenancy) }
  let(:project) { create(:client, parent: tenancy) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, project: nil) }

  before do
    ActsAsTenant.current_tenant = tenancy
  end

  after do
    ActsAsTenant.current_tenant = nil
  end

  it 'creates a client_assessor membership for existing assessors' do
    create(:assessor, user: user, campaign: campaign)

    expect do
      migration.up
    end.to change {
      Membership.where(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    }.from(0).to(1)

    membership = Membership.find_by(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE,
                                    campaign_id: nil)
    expect(membership.tenant_id).to eq(tenancy.id)
  end

  it 'is idempotent for existing client_assessor memberships' do
    create(:assessor, user: user, campaign: campaign)
    create(:membership, user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil)

    expect do
      migration.up
    end.not_to(change do
      Membership.where(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE, campaign_id: nil).count
    end)
  end

  it 'moves project-level client_assessor membership to tenancy-level' do
    create(:assessor, user: user, campaign: campaign)
    membership = build(:membership, user: user, client: project, role: Membership::CLIENT_ASSESSOR_ROLE,
                       campaign_id: nil, tenant_id: nil)
    membership.save(validate: false)

    migration.up

    expect(Membership.where(user: user, client: project, role: Membership::CLIENT_ASSESSOR_ROLE,
                            campaign_id: nil)).to be_empty

    membership = Membership.find_by(user: user, client: tenancy, role: Membership::CLIENT_ASSESSOR_ROLE,
                                    campaign_id: nil)
    expect(membership).to be_present
    expect(membership.tenant_id).to eq(tenancy.id)
  end
end
