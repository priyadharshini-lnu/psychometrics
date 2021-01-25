# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::UsersController, type: :controller do
  let(:current_user) { create(:superadmin) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'POST search_admins' do
    create(:user, email: 'atanych@gmail.com', role: 'Users::Admin')
    post :search_admins, params: {
      q: 'atanych'
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response.first['email']).to eq('atanych@gmail.com')
  end
end
