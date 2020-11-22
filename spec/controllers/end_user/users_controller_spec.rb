# frozen_string_literal: true

require 'rails_helper'

describe EndUser::UsersController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }

  before(:each) do
    login_user(user)
  end

  describe 'POST /users/change_locale' do
    it 'change locale' do
      post :change_locale, params: {
        format: :json,
        locale: 'ru'
      }
      expect(response).to have_http_status(:success)
      expect(I18n.locale).to eq(:ru)
    end
  end

  describe 'PATCH /users/update_details' do
    it 'updates user' do
      patch :update_details, params: {
        format: :json,
        user: { id: user.id, first_name: 'Elliot', last_name: 'Alderson' }
      }
      parsed_result = JSON.parse(response.body)
      expect(response).to have_http_status(:success)

      expected_array = %w[id is_manager email first_name last_name full_name is_anonym is_super_admin]
      expect(parsed_result.keys).to match_array(expected_array)
      expect(parsed_result['id']).to eq(user.id)
      expect(parsed_result['first_name']).to eq('Elliot')
      expect(parsed_result['last_name']).to eq('Alderson')
    end

    it 'returns bad request 400 status if user details doesnt update' do
      patch :update_details, params: {
        format: :json,
        user: { id: user.id, first_name: 'Elliot' }
      }
      expect(response).to have_http_status(:bad_request)
    end
  end
end
