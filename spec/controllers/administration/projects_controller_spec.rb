# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::ProjectsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let!(:project) { create(:project) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'POST search_users' do
    user = create(:user, email: 'atanych@gmail.com', project: project)
    user.user_profile.update(locale: 'en')
    post :search_users, params: {
      id: project.id,
      q: 'atanych'
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response.first['email']).to eq('atanych@gmail.com')
    expect(parsed_response.first['locale']).to eq('en')
  end
end
