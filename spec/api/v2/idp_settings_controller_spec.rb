# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::IdpSettingsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project) }
  let!(:idp_setting) { project.idp_setting }
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/idp_settings' do
    get 'Get a idp settings' do
      operationId 'GetIdpSettings'
      description 'Get Idp Settings'
      tags 'IdpSettngs'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :'filter[project_id_eq]', in: :query, required: true

      response '200', 'IdpSetting Update' do
        schema '$ref' => '#/components/schemas/IdpSettingListResponse'

        let(:'filter[project_id_eq]') { project.id }

        run_test! do |response|
          data = JSON.parse(response.body)['data'].first
          expect(data).to have_key('id')
          expect(data).to have_attribute(:allow_global_skills).with_value(false)
          expect(data).to have_attribute(:manager_approves_idp).with_value(false)
          expect(data).to have_attribute(:manager_can_edit_idp).with_value(false)
          expect(data).to have_relationship(:project).
            with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
        end
      end
    end
  end

  path '/idp_settings/{setting_id}' do
    patch 'Update a idp settings' do
      operationId 'UpdateIdpSettings'
      description 'Update Idp Settings'
      tags 'IdpSettngs'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :setting_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/IdpSettingRequest' },
                required: true

      response '200', 'IdpSetting Update' do
        schema '$ref' => '#/components/schemas/IdpSettingUpdateResponse'

        examples 'application/json' => [{
          type: 'idp_settings',
          data: {
            id: '770',
            attributes: {
              allow_global_skills: false,
              manager_approves_idp: false,
              manager_can_edit_idp: false
            },
            relationships: {
              project: {
                data: {
                  id: '1',
                  type: 'projects'
                }
              }
            }
          }
        }]
        let(:setting_id) { idp_setting.id }
        let(:body) do
          jsonapi_resource_request(
            'idp_settings',
            {
              id: idp_setting.id.to_s,
              allow_global_skills: true,
              manager_approves_idp: true,
              manager_can_edit_idp: true
            },
            { project: { id: project.id.to_s, type: 'projects' } }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:allow_global_skills).with_value(true)
          expect(data).to have_attribute(:manager_approves_idp).with_value(true)
          expect(data).to have_attribute(:manager_can_edit_idp).with_value(true)
          expect(data).to have_relationship(:project).
            with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
        end
      end

      response '422', 'Unprocessable Entity' do
        before { sign_in(client_admin) }
        let(:setting_id) { idp_setting.id }
        let(:body) do
          jsonapi_resource_request(
            'idp_settings',
            {
              id: idp_setting.id.to_s,
              allow_global_skills: true
            }
          )
        end

        run_test! do |response|
          errors = JSON.parse(response.body)['errors']
          expect(errors).to include(
            hash_including(
              'title' => 'not allowed to change',
              'source' => { 'pointer' => '/data/attributes/allow_global_skills' }
            )
          )
        end
      end
    end
  end
end
