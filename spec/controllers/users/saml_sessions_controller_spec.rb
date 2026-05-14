# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SamlSessionsController, type: :controller do
  let(:client) { create(:tenancy) }

  before do
    @request.env['devise.mapping'] = Devise.mappings[:user]
    authrequest_double = instance_double(OneLogin::RubySaml::Authrequest)
    allow(controller).to receive(:saml_config).and_return(OneLogin::RubySaml::Settings.new)
    allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(authrequest_double)
    allow(authrequest_double).to receive(:create).and_return('https://idp.example.com/sso')
    allow(GetProjectBySubdomain).to receive(:call!).and_return(create(:project, client: client))
  end

  describe '#relay_state' do
    context 'when return_url param is present' do
      it 'returns the return_url for SAML RelayState' do
        get :new, params: { return_url: '/admin/projects/288/campaigns' }

        expect(controller.send(:relay_state)).to eq('/admin/projects/288/campaigns')
      end
    end

    context 'when return_url param is absent' do
      it 'returns nil' do
        get :new

        expect(controller.send(:relay_state)).to be_nil
      end
    end
  end

  describe '#after_sign_in_path_for' do
    let(:user) { create(:user) }

    context 'when RelayState param is present' do
      it 'returns the RelayState URL' do
        allow(controller).to receive(:params).
          and_return(ActionController::Parameters.new(RelayState: '/admin/projects/288/campaigns'))

        expect(controller.after_sign_in_path_for(user)).to eq('/admin/projects/288/campaigns')
      end
    end

    context 'when RelayState param is absent' do
      it 'falls back to root path' do
        allow(controller).to receive(:params).and_return(ActionController::Parameters.new({}))

        expect(controller.after_sign_in_path_for(user)).to eq('/')
      end
    end
  end
end
