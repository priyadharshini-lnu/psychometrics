# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TenantEnforcement do
  let(:tenant_a) { create(:tenancy) }
  let(:tenant_b) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:project_b) { create(:project, parent: tenant_b) }
  let!(:campaign_a) { create(:campaign, project: project_a) }
  let!(:campaign_b) { create(:campaign, project: project_b) }

  describe '.globally_disabled?' do
    it 'returns true when disabled flag is enabled' do
      allow(Settings).to receive_message_chain(:tenant_scoping, :disabled).and_return(true)

      expect(described_class.globally_disabled?).to be true
    end

    it 'returns false when disabled flag is off' do
      allow(Settings).to receive_message_chain(:tenant_scoping, :disabled).and_return(false)

      expect(described_class.globally_disabled?).to be false
    end
  end

  describe 'bypass subdomain list' do
    it 'identifies a subdomain in the bypass list' do
      allow(Settings).to receive_message_chain(:tenant_scoping, :bypass_subdomains).and_return([tenant_a.subdomain])

      expect(described_class.subdomain_bypassed?(tenant_a.subdomain)).to be true
    end

    it 'does not identify a subdomain outside the bypass list' do
      allow(Settings).to receive_message_chain(:tenant_scoping, :bypass_subdomains).and_return([tenant_a.subdomain])

      expect(described_class.subdomain_bypassed?(tenant_b.subdomain)).to be false
    end

    it 'matches bypass list entries case-insensitively' do
      allow(Settings).to receive_message_chain(:tenant_scoping,
                                               :bypass_subdomains).and_return([tenant_a.subdomain.upcase])

      expect(described_class.subdomain_bypassed?(tenant_a.subdomain)).to be true
    end

    it 'checks Current.client subdomain when called without arguments' do
      allow(Settings).to receive_message_chain(:tenant_scoping, :bypass_subdomains).and_return([tenant_a.subdomain])
      Current.client = tenant_a

      expect(described_class.client_bypassed?).to be true
    end
  end

  describe 'scoping and data population behavior' do
    it 'returns unscoped data when current_tenant is nil' do
      ActsAsTenant.current_tenant = nil

      expect(Campaign.all).to include(campaign_a, campaign_b)
    end

    it 'infers tenant_id from parent association when current_tenant is not set' do
      campaign = Campaign.new(project: project_a)
      campaign.valid?

      expect(campaign.tenant_id).to eq(tenant_a.id)
    end

    it 'assigns tenant_id from current_tenant when current_tenant is set' do
      campaign = ActsAsTenant.with_tenant(tenant_b) { Campaign.new(project: project_a) }
      campaign.valid?

      expect(campaign.tenant_id).to eq(tenant_b.id)
    end

    it 'scopes data once current_tenant is set again' do
      ActsAsTenant.current_tenant = nil
      expect(Campaign.all).to include(campaign_a, campaign_b)

      ActsAsTenant.with_tenant(tenant_a) do
        expect(Campaign.all).to include(campaign_a)
        expect(Campaign.all).not_to include(campaign_b)
      end
    end
  end
end
