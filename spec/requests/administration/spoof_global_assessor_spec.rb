# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Spoofing into a global assessor', type: :request do
  include ViteTestHelper

  let(:superadmin) { create(:superadmin) }
  # Flag only: no assessor records and no memberships, so nothing ties this user to a client.
  let(:global_assessor) { create(:user, role: User::ADMIN_ROLE, global_assessor: true) }

  before do
    mock_vite_assets
    login_user(superadmin)
  end

  describe 'a target whose only role is global assessor' do
    it 'refuses the impersonation' do
      get spoof_administration_user_path(global_assessor)

      expect(session[:impersonated_by_id]).to be_nil
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'a target with neither client access nor an assessor role' do
    let(:client_less_admin) { create(:user, role: User::ADMIN_ROLE) }

    it 'still refuses the impersonation' do
      get spoof_administration_user_path(client_less_admin)

      expect(session[:impersonated_by_id]).to be_nil
      expect(response).to redirect_to(root_url)
    end
  end

  describe 'a target who is also a superadmin' do
    it 'refuses to impersonate a superadmin who is a global assessor too' do
      assessor_superadmin = create(:superadmin, global_assessor: true)

      get spoof_administration_user_path(assessor_superadmin)

      expect(session[:impersonated_by_id]).to be_nil
      expect(response).to have_http_status(:forbidden)
    end

    it 'refuses to impersonate a plain superadmin' do
      get spoof_administration_user_path(create(:superadmin))

      expect(session[:impersonated_by_id]).to be_nil
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'an assessor whose client_assessor membership was deleted' do
    # Campaign assignments without a membership are not client access, so this user has nowhere to be signed in.
    let(:orphaned_assessor) { create(:user, :assessor, global_assessor: true) }

    it 'refuses the impersonation instead of opening a root domain session' do
      get spoof_administration_user_path(orphaned_assessor)

      expect(session[:impersonated_by_id]).to be_nil
      expect(response).to redirect_to(root_url)
    end

    it 'is not treated as a root domain assessor' do
      expect(orphaned_assessor.clients_with_admin_access).to be_empty
      expect(orphaned_assessor).not_to be_root_domain_assessor
    end
  end

  describe 'a global assessor who also has a client assessor membership' do
    let(:membership_assessor) { create(:user, :assessor, global_assessor: true) }

    it 'still hands off to the client admin subdomain' do
      campaign = membership_assessor.assessors.first.campaign
      Membership.create!(user: membership_assessor, client: campaign.client, role: Membership::CLIENT_ASSESSOR_ROLE)

      get spoof_administration_user_path(membership_assessor)

      expect(response.headers['Location']).to include('/administration/sign_in?handoff_token=')
    end
  end

  describe 'an assessor attached to a client but not yet assigned to any campaign' do
    let(:client) { create(:tenancy) }
    let(:attached_assessor) { create(:user, role: User::ADMIN_ROLE, global_assessor: true) }

    before do
      Membership.create!(user: attached_assessor, client: client, role: Membership::CLIENT_ASSESSOR_ROLE)
      sign_out(superadmin)
      sign_in(attached_assessor)
      host! "#{client.subdomain}-admin.localhost"
    end

    it 'serves the assessor links, since attachment — not assignment — is what shows the pages' do
      get '/api/v2/administration/users/current_user_details'

      expect(response).to have_http_status(:ok)
      links = json_response.dig('data', 'attributes', 'navigation_links', 'links')
      expect(links).to have_key('assessorDashboard')
      expect(links).to have_key('assessorWorkshops')
    end
  end

  describe 'an assessor whose membership was revoked while their session was still active' do
    let(:assessor) { create(:user, :assessor) }
    let(:client) { assessor.assessors.first.campaign.project.client }
    let!(:membership) do
      Membership.create!(user: assessor, client: client, role: Membership::CLIENT_ASSESSOR_ROLE)
    end

    before do
      sign_out(superadmin)
      # Session established while membership is still active, simulating a live session before revocation.
      sign_in(assessor)
      host! "#{client.subdomain}-admin.localhost"
      membership.destroy!
      assessor.memberships.reset
    end

    it 'hides assessor nav links even though campaign assignments still exist' do
      get '/api/v2/administration/users/current_user_details'

      expect(assessor.assessors.reload.count).to eq(1)
      links = json_response.dig('data', 'attributes', 'navigation_links', 'links')
      expect(links).not_to have_key('assessorDashboard')
      expect(links).not_to have_key('assessorWorkshops')
    end
  end
end
