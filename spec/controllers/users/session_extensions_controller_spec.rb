# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SessionExtensionsController, type: :controller do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  before(:each) do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
  end

  describe 'POST #extend' do
    context 'when user is authenticated' do
      before(:each) { login_user(user) }
      after(:each) { sign_out(user) }

      before do
        post :extend, format: :json
      end

      it 'returns http success' do
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when user is not authenticated' do
      before do
        post :extend, format: :json
      end

      it 'returns http unauthorized' do
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
