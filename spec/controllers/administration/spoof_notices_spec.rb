# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::UsersController, type: :controller do
  let(:superadmin) { create(:superadmin) }
  let(:client) { create(:tenancy) }
  let(:target) { create(:client_admin, client: client) }

  before do
    allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
    login_user(superadmin)
  end

  describe 'GET #spoof' do
    it 'sends the shell a query param when the handoff token cannot be minted' do
      allow(AdminAuth::GenerateHandoffToken).to receive(:call).and_return(error: :invalid)

      get :spoof, params: { id: target.id }

      expect(response.location).to include(admin_path(notice: 'handoff_failed'))
      expect(flash[:alert]).to be_nil
    end

    it 'redirects a target without client access to the shell, not the participant root' do
      target.memberships.destroy_all

      get :spoof, params: { id: target.id }

      expect(response.location).to include(admin_path(notice: 'no_client_access_root'))
      expect(response.location).not_to eq(root_url)
    end
  end
end
