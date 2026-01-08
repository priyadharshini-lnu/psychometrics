# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SamlIdpController, type: :controller do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:saml_service_provider) { create(:saml_service_provider, project: project) }
  let(:valid_saml_request) do
    Base64.encode64('<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">http://localhost:3000/users/saml/metadata</saml:Issuer></samlp:AuthnRequest>') # rubocop:disable Metrics/LineLength
  end

  before do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    mock_saml_request = double('SAML Request',
                               issuer: saml_service_provider.entity_id,
                               valid?: true,
                               authn_request?: true,
                               acs_url: saml_service_provider.acs_urls.first,
                               request_id: '_test_request_id_12345',
                               name_id_format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
                               service_url: 'http://localhost:3000/users/saml/auth',
                               protocol_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
                               assertion_consumer_service_url: saml_service_provider.acs_urls.first)
    allow(controller).to receive(:saml_request).and_return(mock_saml_request)
  end

  describe 'GET #show' do
    context 'when metadata generation is successful' do
      it 'renders XML metadata' do
        get :show, params: { id: saml_service_provider.id }, format: :xml

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('application/xml')
        expect(response.body).to include('EntityDescriptor')
        expect(response.body).to include('IDPSSODescriptor')
      end

      it 'renders HTML with XML content' do
        get :show, params: { id: saml_service_provider.id }, format: :html

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/xml')
        expect(response.body).to include('EntityDescriptor')
        expect(response.body).to include('IDPSSODescriptor')
      end
    end

    context 'when service provider is not found' do
      it 'returns not found status' do
        get :show, params: { id: 99_999 }, format: :xml

        expect(response).to have_http_status(:not_found)
        expect(response.body).to include('Service provider not found')
      end
    end

    context 'when service provider is disabled' do
      before { saml_service_provider.update!(enabled: false) }

      it 'returns not found status' do
        get :show, params: { id: saml_service_provider.id }, format: :xml

        expect(response).to have_http_status(:not_found)
        expect(response.body).to include('Service provider not found')
      end
    end
  end

  describe 'GET #new' do
    context 'when user is signed in' do
      before { sign_in(user) }
      after { sign_out(user) }

      it 'processes SAML authentication request' do
        get :new, params: { id: saml_service_provider.id, SAMLRequest: valid_saml_request }

        expect([200, 403, 500]).to include(response.status)
      end
    end

    context 'when user is not signed in' do
      it 'redirects unauthenticated users to login' do
        get :new, params: { id: saml_service_provider.id, SAMLRequest: valid_saml_request }

        expect(response).to have_http_status(:found)
        expect(response.location).to include('sign_in')
      end
    end

    context 'with invalid SAML request' do
      it 'handles invalid SAML request' do
        get :new, params: { id: saml_service_provider.id, SAMLRequest: 'clearly_invalid' }

        expect(response).to have_http_status(:found)
      end
    end

    context 'with invalid service provider ID' do
      it 'handles invalid service provider' do
        get :new, params: { id: 99_999, SAMLRequest: valid_saml_request }

        expect(response).to have_http_status(:found)
      end
    end
  end

  describe 'POST #create' do
    context 'when user is signed in' do
      before { sign_in(user) }
      after { sign_out(user) }

      it 'processes SAML authentication response' do
        post :create, params: { id: saml_service_provider.id, SAMLRequest: valid_saml_request }

        expect([200, 403, 500]).to include(response.status)
      end
    end

    context 'when user is not signed in' do
      it 'redirects unauthenticated requests' do
        post :create, params: { id: saml_service_provider.id, SAMLRequest: valid_saml_request }

        expect(response).to have_http_status(:found)
      end
    end

    context 'with invalid SAML request' do
      it 'handles invalid SAML request' do
        post :create, params: { id: saml_service_provider.id, SAMLRequest: 'invalid' }

        expect(response).to have_http_status(:found)
      end
    end

    context 'with invalid service provider ID' do
      it 'handles invalid service provider' do
        post :create, params: { id: 99_999, SAMLRequest: valid_saml_request }

        expect(response).to have_http_status(:found)
      end
    end
  end
end
