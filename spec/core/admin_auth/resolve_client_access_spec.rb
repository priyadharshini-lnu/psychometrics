# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::ResolveClientAccess do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client) }

  describe '.call' do
    context 'with superadmin user' do
      let(:superadmin) { create(:superadmin) }

      it 'returns no access when no memberships exist' do
        result = described_class.call(superadmin, client)

        expect(result[:error]).to eq(:no_access)
      end

      context 'when superadmin also has a client_admin membership' do
        before do
          create(:membership, user: superadmin, client: client, role: 'client_admin')
        end

        it 'returns actual membership roles' do
          result = described_class.call(superadmin, client)

          expect(result[:ok]).to include(
            has_access: true,
            highest_role: 'client_admin',
            roles: ['client_admin']
          )
          expect(result[:ok][:memberships]).not_to be_empty
        end
      end
    end

    context 'with client_admin user' do
      let(:user) { create(:user) }

      before do
        create(:membership, user: user, client: client, role: 'client_admin')
      end

      it 'returns access with client_admin role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:highest_role]).to eq('client_admin')
        expect(result[:ok][:roles]).to include('client_admin')
      end
    end

    context 'with project_admin user' do
      let(:user) { create(:user) }

      before do
        create(:membership, user: user, client: project, role: 'project_admin')
      end

      it 'returns access with project_admin role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:highest_role]).to eq('project_admin')
        expect(result[:ok][:roles]).to include('project_admin')
      end
    end

    context 'with campaign_admin user' do
      let(:user) { create(:user) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        create(:membership, user: user, campaign: campaign, client: project, role: 'campaign_admin')
      end

      it 'returns access with campaign_admin role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:highest_role]).to eq('campaign_admin')
        expect(result[:ok][:roles]).to include('campaign_admin')
      end
    end

    context 'with user having multiple roles' do
      let(:user) { create(:user) }

      before do
        create(:membership, user: user, client: client, role: 'client_admin')
        create(:membership, user: user, client: project, role: 'project_admin')
      end

      it 'returns highest priority role' do
        result = described_class.call(user, client)

        expect(result[:ok][:highest_role]).to eq('client_admin')
        expect(result[:ok][:roles]).to include('client_admin', 'project_admin')
      end
    end

    context 'with assessor user' do
      let(:user) { create(:user) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        create(:assessor, user: user, campaign: campaign)
      end

      it 'returns access with assessor role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:highest_role]).to eq('assessor')
        expect(result[:ok][:roles]).to include('assessor')
      end
    end

    context 'with user having no access' do
      let(:user) { create(:user) }
      let(:other_client) { create(:tenancy) }

      before do
        create(:membership, user: user, client: other_client, role: 'client_admin')
      end

      it 'returns no access error' do
        result = described_class.call(user, client)

        expect(result[:error]).to eq(:no_access)
      end
    end

    context 'with disabled user' do
      let(:user) { create(:user, disabled: true) }

      it 'returns error' do
        result = described_class.call(user, client)

        expect(result[:error]).to eq(:user_disabled)
      end
    end

    context 'with inactive client' do
      let(:user) { create(:superadmin) }

      before do
        client.update!(disabled: true, archived: true)
      end

      it 'returns error' do
        result = described_class.call(user, client)

        expect(result[:error]).to eq(:invalid_client)
      end
    end

    context 'with nil user' do
      it 'returns error' do
        result = described_class.call(nil, client)

        expect(result[:error]).to eq(:invalid_user)
      end
    end

    context 'with nil client' do
      let(:user) { create(:superadmin) }

      it 'returns error' do
        result = described_class.call(user, nil)

        expect(result[:error]).to eq(:invalid_client)
      end
    end
  end
end
