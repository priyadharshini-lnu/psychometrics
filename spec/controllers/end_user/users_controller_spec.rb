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
        locale: 'ar'
      }
      expect(response).to have_http_status(:success)
      expect(I18n.locale).to eq(:ar)
    end
  end
end
