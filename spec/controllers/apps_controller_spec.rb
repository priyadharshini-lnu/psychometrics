# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET global_config' do
    it 'returns global config' do
      get :global_config

      response_body = response.parsed_body

      expect(response).to have_http_status(:success)
      expect(response_body).to include('feature_flags')
      expect(response_body).to include('available_locales')
    end
  end
end
