# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::ClientsController, type: :controller do
  let!(:client) { create(:tenancy) }
  let!(:client_membership) { create(:client_admin_membership) }
  let!(:project_membership) { create(:project_admin_membership) }

  describe 'As superadmin  user' do
    let(:current_user) { create(:superadmin) }
    before(:each) { sign_in(current_user) }
    after(:each) { sign_out(current_user) }

    it 'lists all clients for superadmin' do
      get :index
      expect(response.status).to eq(200)
      expect(assigns(:_resources).count).to eq(3)
      expect(assigns(:_resources)).to include(
        client,
        client_membership.client,
        project_membership.client.parent
      )
    end
  end

  describe 'As client admin user' do
    let(:current_user) { client_membership.user }
    before(:each) { sign_in(current_user) }
    after(:each) { sign_out(current_user) }

    it 'lists all clients specific to client admin' do
      get :index
      expect(response.status).to eq(200)
      expect(assigns(:_resources).count).to eq(1)
      expect(assigns(:_resources)).to include(client_membership.client)
    end
  end

  describe 'As project admin user' do
    let(:current_user) { project_membership.user }
    before(:each) { sign_in(current_user) }
    after(:each) { sign_out(current_user) }

    it 'lists all clients specific to project admin' do
      get :index
      expect(response.status).to eq(200)
      expect(assigns(:_resources).count).to eq(1)
      expect(assigns(:_resources)).to include(project_membership.client.parent)
    end
  end
end
