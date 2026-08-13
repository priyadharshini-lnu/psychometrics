# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Root domain isolation for the administration API', type: :request do
  let(:client_assessor) { create(:user, :assessor) }
  let(:client) { client_assessor.assessors.first.campaign.project.client }

  before do
    Membership.create!(user: client_assessor, client: client, role: Membership::CLIENT_ASSESSOR_ROLE)
  end

  describe 'a user whose client access funnels them through client selection' do
    before { sign_in(client_assessor) }

    it 'refuses an API call made from the root domain' do
      host! 'localhost'

      get '/api/v2/administration/user_availability_dates'

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['errors'].first['title']).to eq(I18n.t('errors.forbidden'))
    end

    it 'serves the same call from the client admin subdomain' do
      host! "#{client.subdomain}-admin.localhost"

      get '/api/v2/administration/user_availability_dates'

      expect(response).to have_http_status(:ok)
    end

    it 'still serves current_user_details so the client selection page can render the profile menu' do
      host! 'localhost'

      get '/api/v2/administration/users/current_user_details'

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'a root domain assessor' do
    let(:global_assessor) { create(:user, role: User::ADMIN_ROLE, global_assessor: true) }

    before { sign_in(global_assessor) }

    it 'keeps working on the root domain' do
      host! 'localhost'

      get '/api/v2/administration/user_availability_dates'

      expect(response).to have_http_status(:ok)
    end

    it 'keeps booting the shell on the root domain' do
      host! 'localhost'

      get '/api/v2/administration/users/current_user_details'

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'a superadmin' do
    before { sign_in(create(:superadmin)) }

    it 'is untouched on the root domain' do
      host! 'localhost'

      get '/api/v2/administration/user_availability_dates'

      expect(response).to have_http_status(:ok)
    end
  end
end
