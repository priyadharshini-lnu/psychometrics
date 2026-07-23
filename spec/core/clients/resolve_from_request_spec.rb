# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Clients::ResolveFromRequest do
  let(:tenant) { create(:tenancy) }
  let(:project) { create(:project, parent: tenant) }
  let(:campaign) { create(:campaign, project: project) }

  describe '.call!' do
    context 'when the path contains a client id' do
      it 'resolves the client from the path' do
        result = described_class.call!("/administration/clients/#{tenant.id}", {})

        expect(result).to eq(tenant)
      end
    end

    context 'when the path contains a project id' do
      it 'resolves the project root client from the path' do
        result = described_class.call!("/administration/projects/#{project.id}", {})

        expect(result).to eq(project.client)
      end
    end

    context 'when the path contains a campaign id' do
      it 'resolves the campaign client from the path' do
        result = described_class.call!("/administration/campaigns/#{campaign.id}", {})

        expect(result).to eq(campaign.client)
      end
    end

    context 'when the client id is only in the filter params' do
      it 'resolves the client from filter[client_id_eq]' do
        params = { 'filter' => { 'client_id_eq' => tenant.id.to_s } }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(tenant)
      end

      it 'resolves the client from filter[owner_id_eq]' do
        params = { 'filter' => { 'owner_id_eq' => tenant.id.to_s } }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(tenant)
      end

      it 'resolves the client from filter[project_id_eq]' do
        params = { 'filter' => { 'project_id_eq' => project.id.to_s } }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(project.client)
      end

      it 'resolves the client from filter[campaign_id_eq]' do
        params = { 'filter' => { 'campaign_id_eq' => campaign.id.to_s } }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(campaign.client)
      end
    end

    context 'when the client id is only in the params' do
      it 'resolves the client from params[client_id]' do
        params = { 'client_id' => tenant.id.to_s }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(tenant)
      end

      it 'resolves the client from params[project_id]' do
        params = { 'project_id' => project.id.to_s }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(project.client)
      end

      it 'resolves the client from params[campaign_id]' do
        params = { 'campaign_id' => campaign.id.to_s }.with_indifferent_access

        result = described_class.call!('/administration/admin_jobs', params)

        expect(result).to eq(campaign.client)
      end
    end

    context 'when both the path and the filter reference a client' do
      it 'prefers the client resolved from the path' do
        other = create(:tenancy)
        params = { 'filter' => { 'client_id_eq' => other.id.to_s } }.with_indifferent_access

        result = described_class.call!("/administration/clients/#{tenant.id}", params)

        expect(result).to eq(tenant)
      end
    end

    context 'when no client can be resolved' do
      it 'returns nil' do
        result = described_class.call!('/administration/admin_jobs', {})

        expect(result).to be_nil
      end
    end
  end
end
