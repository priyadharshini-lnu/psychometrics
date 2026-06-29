# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::PublicKeysController, type: :controller do
  let(:tenant) { create(:tenancy) }
  let(:superadmin) { create(:superadmin) }
  let(:application_user) { create(:application_user, tenant: tenant) }
  let(:rsa_key) { OpenSSL::PKey::RSA.generate(2048) }
  let!(:public_key_record) do
    create(:application_public_key, user: application_user, public_key: rsa_key.public_key.to_pem)
  end

  before do
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #index' do
    it 'returns success status' do
      get :index, params: { application_id: application_user.id }
      expect(response).to have_http_status(:ok)
    end

    it 'returns only public keys for the given application user' do
      other_app = create(:application_user, tenant: tenant)
      create(:application_public_key, user: other_app)

      get :index, params: { application_id: application_user.id }
      ids = parsed_response['data'].map { |d| d['id'].to_i }

      expect(ids).to include(public_key_record.id)
      expect(ids.count).to eq(1)
    end
  end

  describe 'POST #generate_key_pair' do
    let(:generate_params) do
      {
        application_id: application_user.id,
        data: { type: 'public_keys', attributes: { description: 'CI/CD key' } }
      }
    end

    it 'creates a new ApplicationPublicKey record' do
      expect do
        post :generate_key_pair, params: generate_params
      end.to change(ApplicationPublicKey, :count).by(1)
    end

    it 'returns the private key in the response' do
      post :generate_key_pair, params: generate_params
      expect(parsed_response['private_key']).to start_with('-----BEGIN RSA PRIVATE KEY-----')
    end

    it 'does not store the private key in the database' do
      post :generate_key_pair, params: generate_params
      stored = ApplicationPublicKey.last
      expect(stored.public_key).to start_with('-----BEGIN PUBLIC KEY-----')
    end

    it 'associates the key with the correct application user' do
      post :generate_key_pair, params: generate_params
      expect(ApplicationPublicKey.last.user_id).to eq(application_user.id)
    end

    it 'stores the description' do
      post :generate_key_pair, params: generate_params
      expect(ApplicationPublicKey.last.description).to eq('CI/CD key')
    end
  end

  describe 'PATCH #update (activate/deactivate)' do
    let(:update_params) do
      {
        application_id: application_user.id,
        id: public_key_record.id,
        data: { type: 'public_keys', id: public_key_record.id.to_s, attributes: { disabled: true } }
      }
    end

    it 'updates the disabled flag' do
      patch :update, params: update_params
      expect(public_key_record.reload.disabled).to be true
    end

    it 'returns success status' do
      patch :update, params: update_params
      expect(response).to have_http_status(:ok)
    end
  end

  private

  def parsed_response
    JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
  end
end
