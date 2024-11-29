# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::DashboardsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project) }
  let!(:design_setting) { project.design_setting }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/design_settings' do
    get 'Get a design settings' do
      operationId 'GetDesignSettings'
      description 'Get Design Settings'
      tags 'DesignSettngs'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :'filter[project_id_eq]', in: :query, required: true

      response '200', 'DesignSetting Update' do
        schema '$ref' => '#/components/schemas/DesignSettingListResponse'

        let(:'filter[project_id_eq]') { project.id }

        run_test! do |response|
          data = JSON.parse(response.body)['data'].first
          expect(data).to have_key('id')
          expect(data).to have_attribute(:logo_alt_text).with_value(project.name)
          expect(data).to have_attribute(:secondary_logo_alt_text).with_value(project.name)
          expect(data).to have_attribute(:logo).with_value(nil)
          expect(data).to have_relationship(:project).
            with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
        end
      end
    end
  end

  path '/design_settings/{setting_id}' do
    patch 'Update a design settings' do
      operationId 'UpdateDesignSettings'
      description 'Update Design Settings'
      tags 'DesignSettngs'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :setting_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/DesignSettingRequest' },
                required: true

      response '200', 'DesignSetting Update' do
        schema '$ref' => '#/components/schemas/DesignSettingUpdateResponse'

        examples 'application/json' => [{
          type: 'design_settings',
          data: {
            id: '770',
            attributes: {
              background_color: '#f00',
              login_box_position: 'left'
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
        let(:setting_id) { design_setting.id }
        let(:body) do
          jsonapi_resource_request(
            'design_settings',
            { id: design_setting.id.to_s, background_color: '#f00', login_box_position: 'left' },
            { project: { id: project.id.to_s, type: 'projects' } }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:background_color).with_value('#f00')
          expect(data).to have_attribute(:login_box_position).with_value('left')
          expect(data).to have_relationship(:project).
            with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
        end
      end

      response '422', 'Unprocessable Entity' do
        let(:setting_id) { design_setting.id }
        let(:body) do
          jsonapi_resource_request(
            'design_settings',
            {
              id: design_setting.id.to_s,
              logo_alt_text: 'Proj@2024',
              secondary_logo_alt_text: 'a' * 300
            }
          )
        end

        run_test! do |response|
          errors = JSON.parse(response.body)['errors']
          expect(errors).to include(
            hash_including(
              'title' => 'is in invalid format',
              'source' => { 'pointer' => '/data/attributes/logo_alt_text' }
            ),
            hash_including(
              'title' => 'size cannot be greater than 100',
              'source' => { 'pointer' => '/data/attributes/secondary_logo_alt_text' }
            )
          )
        end
      end
    end
  end
end
