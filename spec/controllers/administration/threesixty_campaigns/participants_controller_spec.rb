# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ThreesixtyCampaigns::ParticipantsController, type: :controller do
  let(:superadmin) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }

  before(:each) { login_user(superadmin) }

  describe 'GET #spoof' do
    context 'when user is a superadmin or project admin' do
      let(:participant_user) { create(:project_admin, project: project) }
      let!(:participant) { create(:threesixty_participant, campaign_id: campaign.id, subject_id: participant_user.id) }

      context 'when client admin sso is disabled' do
        before do
          allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(false)
        end

        it 'falls back to root-domain impersonation and redirects to admin_path' do
          get :spoof, params: { threesixty_campaign_id: threesixty_campaign.id, id: participant_user.id }

          expect(response).to have_http_status(:found)
          expect(response).to redirect_to(admin_path)
          expect(session[:impersonated_by_id]).to eq(superadmin.id)
        end
      end
    end

    context 'when user is an end user' do
      let(:participant_user) { create(:user, project: project) }
      let!(:participant) { create(:threesixty_participant, campaign_id: campaign.id, subject_id: participant_user.id) }

      it 'impersonates as end user and redirects to participant portal' do
        get :spoof, params: { threesixty_campaign_id: threesixty_campaign.id, id: participant_user.id }

        expect(response).to have_http_status(:found)
        # Should redirect to the root URL with a spoof token
        expect(response.location).to include('spoof_token=')
        # Ensures no admin session was created
        expect(session[:impersonated_by_id]).to be_nil
      end
    end
  end
end
