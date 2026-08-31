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

    context 'with client_assessor user' do
      let(:user) { create(:user) }

      before do
        create(:membership, user: user, client: client, role: 'client_assessor')
      end
      it 'returns access with client_assessor role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:highest_role]).to eq('client_assessor')
        expect(result[:ok][:roles]).to include('client_assessor')
      end
    end

    context 'with assessor user' do
      let(:user) { create(:user) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        # Every path that assigns an assessor also creates this membership.
        create(:membership, user: user, client: client, role: 'client_assessor')
        create(:assessor, user: user, campaign: campaign)
      end

      it 'returns access with the assessor role' do
        result = described_class.call(user, client)

        expect(result[:ok][:has_access]).to be true
        expect(result[:ok][:roles]).to include('assessor')
      end
    end

    context 'with an assessor whose client assessor membership was removed' do
      let(:user) { create(:user) }
      let(:campaign) { create(:campaign, project: project) }

      before do
        membership = create(:membership, user: user, client: client, role: 'client_assessor')
        create(:assessor, user: user, campaign: campaign)
        membership.destroy!
      end

      it 'refuses access even though the campaign assignment remains' do
        expect(user.assessors.count).to eq(1)
        expect(described_class.call(user, client)).to eq(error: :no_access)
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

  describe '.superadmin_has_role_on?' do
    let(:superadmin) { create(:superadmin) }

    context 'when user is not a superadmin' do
      let(:regular_user) { create(:user) }

      it 'returns false regardless of memberships' do
        create(:membership, user: regular_user, client: client, role: 'client_admin')

        expect(described_class.superadmin_has_role_on?(regular_user, client)).to be false
      end
    end

    context 'when superadmin has no memberships on the client' do
      it 'returns false' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be false
      end
    end

    context 'when superadmin has a client_admin membership on the client' do
      before { create(:membership, user: superadmin, client: client, role: 'client_admin') }

      it 'returns true' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be true
      end
    end

    context 'when superadmin has a project_admin membership on a child project' do
      before { create(:membership, user: superadmin, client: project, role: 'project_admin') }

      it 'returns true' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be true
      end
    end

    context 'when superadmin has a campaign_admin membership on a child project' do
      let(:campaign) { create(:campaign, project: project) }

      before { create(:membership, user: superadmin, campaign: campaign, client: project, role: 'campaign_admin') }

      it 'returns true' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be true
      end
    end

    context 'when superadmin has a membership only on a different client' do
      let(:other_client) { create(:tenancy) }

      before { create(:membership, user: superadmin, client: other_client, role: 'client_admin') }

      it 'returns false' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be false
      end
    end

    context 'when superadmin has a non-admin role (client_assessor) on the client' do
      before { create(:membership, user: superadmin, client: client, role: 'client_assessor') }

      it 'returns false' do
        expect(described_class.superadmin_has_role_on?(superadmin, client)).to be false
      end
    end
  end
end
