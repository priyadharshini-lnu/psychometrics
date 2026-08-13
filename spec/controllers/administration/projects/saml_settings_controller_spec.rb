# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Projects::SamlSettingsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'POST create' do
    it 'creates saml_setting and saves setting ' do
      saml_setting_attributes = attributes_for(:saml_setting)
      post :create, params: {
        project_id: project.id,
        resource: saml_setting_attributes
      }, format: :json

      expect(response.status).to eq(200)
      expect(project.reload.saml_setting.persisted?).to eq(true)
      expect(project.saml_setting.entity_id).to eq(saml_setting_attributes[:entity_id])
    end

    it "doesn't create params are not valid" do
      saml_setting_attributes = attributes_for(:saml_setting, entity_id: nil)
      post :create, params: {
        project_id: project.id,
        resource: saml_setting_attributes
      }, format: :json

      parsed_response = response.parsed_body
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'entity_id' => ["can't be blank"] } })
    end
  end

  describe 'PUT update' do
    let(:saml_setting) { create(:saml_setting, project: project) }

    it 'updates saml_setting directly into columns if saml verification is not required' do
      saml_setting.update(attributes_for(:saml_setting).merge(enabled: false))
      saml_setting_attributes = saml_setting.attributes.merge('enabled' => true)
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: saml_setting_attributes
      }, format: :json
      saml_setting.reload

      parsed_response = response.parsed_body
      expect(response.status).to eq(200)
      expect(parsed_response['enabled']).to eq(true)
    end

    it "doesn't update params are not valid" do
      saml_setting.update(attributes_for(:saml_setting).merge(enabled: false))
      saml_setting_attributes = saml_setting.attributes.merge('entity_id' => '')
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: saml_setting_attributes
      }, format: :json
      saml_setting.reload

      parsed_response = response.parsed_body
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'entity_id' => ["can't be blank"] } })
    end

    it 'allows all blank attribute if saml is not enabled' do
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: { enabled: false, enforce_for: 'none', entity_id: '', sso_service_url: '' }
      }, format: :json
      saml_setting.reload

      expect(response.status).to eq(200)
      expect(saml_setting.entity_id).to_not eq('')
      expect(saml_setting.sso_service_url).to_not eq('')
    end

    it "doesn't allow update if some fields are present and some are absent when saml is not enabled" do
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: { enabled: false, enforce_for: 'none', entity_id: 'entity_id', sso_service_url: '' }
      }, format: :json
      saml_setting.reload

      expect(response.status).to eq(422)
    end
  end

  describe 'POST parse_metadata' do
    let(:metadata_xml) { Rails.root.join('spec/fixtures/files/saml_metadata.xml').read }

    it 'parses valid metadata XML and returns extracted fields' do
      post :parse_metadata, params: { project_id: project.id, xml: metadata_xml }, format: :json

      expect(response).to have_http_status(:ok)
      result = response.parsed_body
      expect(result).to include(
        'idp_entity_id' => 'https://idp.example.com/entity',
        'idp_sso_url' => 'https://idp.example.com/sso',
        'idp_slo_url' => 'https://idp.example.com/slo'
      )
      expect(result['idp_cert']).to start_with('-----BEGIN CERTIFICATE-----')
      expect(result['certificate_expiry']).to be_present
    end

    it 'returns 422 for invalid XML' do
      post :parse_metadata, params: { project_id: project.id, xml: 'not valid xml <<<>>>' }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body['errors']).to be_present
    end
  end
end
