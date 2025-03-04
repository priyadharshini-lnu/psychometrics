# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Projects::SamlSettingsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'POST create' do
    it 'creates saml_setting and saves setting in test_settings column' do
      saml_setting_attributes = attributes_for(:saml_setting)
      post :create, params: {
        project_id: project.id,
        resource: saml_setting_attributes
      }, format: :json

      expect(response.status).to eq(200)
      expect(project.reload.saml_setting.persisted?).to eq(true)
      expect(project.saml_setting.test_settings.symbolize_keys).to eq(saml_setting_attributes)
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

    it 'save setting as test setting if field changes require saml flow verification' do
      saml_setting.update(attributes_for(:saml_setting).merge(enabled: false))
      saml_setting_attributes = saml_setting.attributes.merge('entity_id' => 'new_idp_entity_id')
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: saml_setting_attributes
      }, format: :json
      saml_setting.reload

      expect(response.status).to eq(200)
      expect(saml_setting.entity_id).to_not eq('new_idp_entity_id')
      expect(saml_setting.test_settings['entity_id']).to eq('new_idp_entity_id')
    end

    it 'allows all blank attribute if saml is not enabled' do
      put :update, params: {
        project_id: project.id,
        id: saml_setting.id,
        resource: { enabled: false, entity_id: '', sso_service_url: '' }
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
        resource: { enabled: false, entity_id: 'entity_id', sso_service_url: '' }
      }, format: :json
      saml_setting.reload

      expect(response.status).to eq(422)
    end
  end
end
