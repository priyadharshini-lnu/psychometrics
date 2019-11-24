# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'HomeController', type: :request do
  let(:project) { create(:project) }
  let(:dashboard_url) { root_url(subdomain: project.subdomain, domain: Settings.domain, port: Settings.port) }

  it 'sets a identification cookie and redirects to root_path' do
    get "#{dashboard_url}/identify"

    expect(response.cookies['ident_session']).to eq('1')
    expect(response).to redirect_to(root_path)
  end

  it 'sets a identification cookie and redirects to return_url' do
    redirect_url = 'https://test.com'
    get "#{dashboard_url}/identify?redirect_url=#{redirect_url}"

    expect(response.cookies['ident_session']).to eq('1')
    expect(response).to redirect_to(redirect_url)
  end
end
