# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::HighestClientRoles do
  describe '.for_user' do
    let(:tenancy) { create(:tenancy) }
    let(:second_tenancy) { create(:tenancy) }

    context 'with blank user or clients' do
      it 'returns empty hash for nil user' do
        expect(described_class.for_user(nil, [tenancy])).to eq({})
      end

      it 'returns empty hash for nil clients' do
        expect(described_class.for_user(create(:superadmin), nil)).to eq({})
      end
    end

    context 'with superadmin user' do
      let(:superadmin) { create(:superadmin) }

      it 'returns superadmin role for every client' do
        result = described_class.for_user(superadmin, [tenancy, second_tenancy])

        expect(result).to eq(tenancy.id => 'superadmin', second_tenancy.id => 'superadmin')
      end
    end

    context 'with client_admin membership' do
      let(:user) { create(:user) }

      before do
        create(:membership, user: user, client: tenancy, role: 'client_admin')
      end

      it 'returns client_admin as highest role' do
        result = described_class.for_user(user, [tenancy])

        expect(result[tenancy.id]).to eq('client_admin')
      end
    end

    context 'with multiple roles on the same client' do
      let(:user) { create(:user) }
      let(:project) { create(:client, parent: tenancy) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        create(:membership, user: user, client: tenancy, role: 'client_admin')
        create(:membership, user: user, client: project, role: 'campaign_admin', campaign: campaign)
      end

      it 'keeps the highest priority role' do
        result = described_class.for_user(user, [tenancy])

        expect(result[tenancy.id]).to eq('client_admin')
      end
    end

    context 'with user having no membership for requested client' do
      let(:user) { create(:user) }

      it 'does not include that client in the result' do
        result = described_class.for_user(user, [tenancy])

        expect(result).not_to have_key(tenancy.id)
      end
    end

    context 'with project-level membership only' do
      let(:user) { create(:user) }
      let(:project) { create(:client, parent: tenancy) }

      before do
        create(:membership, user: user, client: project, role: 'project_admin')
      end

      it 'maps the project-level role back to the tenancy' do
        result = described_class.for_user(user, [tenancy])

        expect(result[tenancy.id]).to eq('project_admin')
      end
    end

    context 'with campaign-level membership only' do
      let(:user) { create(:user) }
      let(:project) { create(:client, parent: tenancy) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        create(:membership, user: user, client: project, role: 'campaign_admin', campaign: campaign)
      end

      it 'maps the campaign-level role back to the tenancy' do
        result = described_class.for_user(user, [tenancy])

        expect(result[tenancy.id]).to eq('campaign_admin')
      end
    end
  end
end
