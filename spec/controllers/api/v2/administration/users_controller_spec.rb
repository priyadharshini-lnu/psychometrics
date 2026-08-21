# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UsersController, type: :controller do
  let(:superadmin) { create(:superadmin, last_sign_in_at: 2.days.ago) }

  before do
    login_user(superadmin)
    session[Users::SignInNotice::SESSION_KEY] = { 'kind' => 'last_sign_in', 'at' => 1.day.ago.to_i }
  end

  describe 'GET #current_user_details' do
    def sign_in_notice_attribute
      # response.parsed_body leaves vnd.api+json as a string, so parse it here.
      JSON.parse(response.body).dig('data', 'attributes', 'sign_in_notice') # rubocop:disable Rails/ResponseParsedBody
    end

    it 'returns the notice and clears the marker' do
      get :current_user_details

      expect(sign_in_notice_attribute['kind']).to eq('last_sign_in')
      expect(session[Users::SignInNotice::SESSION_KEY]).to be_nil
    end

    it 'stays silent while impersonating' do
      session[:impersonated_by_id] = create(:superadmin).id

      get :current_user_details

      expect(sign_in_notice_attribute).to be_nil
      expect(session[Users::SignInNotice::SESSION_KEY]).to be_nil
    end
  end
end
