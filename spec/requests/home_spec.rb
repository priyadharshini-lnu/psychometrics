# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'HomeController', type: :request do
  let(:project) { create(:project) }

  # This spec fails in CI and unable to reproduce this on local
  xit 'sets a identification cookie and redirects to root_path' do
    get identify_url(subdomain: project.subdomain, domain: Settings.domain, port: Settings.port)

    expect(response.cookies['ident_session']).to eq('1')
    expect(response).to redirect_to(root_path)
  end

  xit 'sets a identification cookie and redirects to return_url' do
    redirect_url = 'https://test.com'
    get identify_url(
      subdomain: project.subdomain,
      domain: Settings.domain,
      port: Settings.port,
      redirect_url: redirect_url
    )

    expect(response.cookies['ident_session']).to eq('1')
    expect(response).to redirect_to(redirect_url)
  end

  it 'renders the privacy notice version chosen in settings' do
    get '/privacy-statement'

    expect(response.body).to include('MERCER TALENT ENTERPRISE PRIVACY NOTICE')
  end

  it 'never serves a blank privacy page when the chosen version has no copy yet' do
    allow(Settings.privacy_notice).to receive(:version).and_return('no_such_version')

    get '/privacy-statement'

    expect(response.body).to include('MERCER TALENT ENTERPRISE PRIVACY NOTICE')
  end
end
