# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::SkillAliasesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:client) { create(:tenancy) }
  let(:client_id) { client.id }
  let!(:project) { Project.find(create(:project, parent: client).id) }
  let(:skill) { create(:skill, project: project) }
  let(:skill_id) { skill.id }
  let(:skill_two) { create(:skill, project: project) }
  let(:skill_id_two) { skill_two.id }
  let!(:skill_alias) { create(:skill_alias, client_id: client.id, skill_id: skill_id) }
  let(:skill_alias_id) { skill_alias.id }

  before { sign_in(superadmin) }

  path '/clients/{client_id}/skill_aliases' do
    get 'Skill Alias list' do
      operationId 'SkillAliasList'
      tags 'SkillAliases'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', ' list' do
        schema '$ref' => '#/components/schemas/SkillAliasListResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'skill_aliases',
            attributes: {
              name: 'Skill XYZ',
              client_id: '1',
              skill_id: '1'
            }
          }
        }]

        run_test! do |response|
          skill_aliases_response = JSON.parse(response.body)['data'].find { |d| d['id'] == skill_alias.id.to_s }
          expect(skill_aliases_response).to have_attribute(:name).with_value(skill_alias.name)
          expect(skill_aliases_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
          expect(skill_aliases_response).to have_attribute(:client_id).with_value(client_id.to_s)
        end
      end
    end

    post 'Create Skill Alias' do
      operationId 'SkillAliasRole'
      description 'Create new Skill Alias'
      tags 'SkillAliases'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/SkillAliasCreateRequest' },
                required: true

      response '201', 'Skill Alias Created' do
        schema '$ref' => '#/components/schemas/SkillAliasResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'skill_aliases',
            attributes: {
              name: 'Skill XYZ',
              client_id: '1',
              skill_id: '1'
            }
          }
        }]

        let(:body) do
          {
            data: {
              type: 'skill_aliases',
              attributes: {
                name: 'Skill XYZ',
                skill_id: skill_id_two.to_s
              }
            }
          }
        end

        run_test! do |response|
          skill_alias_response = JSON.parse(response.body)['data']
          expect(skill_alias_response).to have_key('id')
          expect(skill_alias_response).to have_attribute(:name).with_value('Skill XYZ')
          expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id_two.to_s)
        end
      end
    end
  end

  path '/clients/{client_id}/skill_aliases/{skill_alias_id}' do
    get 'Skill Alias' do
      operationId 'SkillAlias'
      description 'Fetch Skill Alias'
      tags 'SkillAliases'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :skill_alias_id, in: :path, type: :string

      response '200', 'Skill Alias' do
        schema '$ref' => '#/components/schemas/SkillAliasResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'skill_aliases',
            attributes: {
              name: 'Skill XYZ',
              client_id: '1',
              skill_id: '1'
            }
          }
        }]

        run_test! do |response|
          skill_alias_response = JSON.parse(response.body)['data']
          expect(skill_alias_response).to have_key('id')
          expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
          expect(skill_alias_response).to have_attribute(:name).with_value(skill_alias.name)
          expect(skill_alias_response).to have_attribute(:client_id).with_value(client_id.to_s)
        end
      end
    end

    patch 'Update an Skill Alias' do
      operationId 'UpdateSkillAlias'
      description 'Update Skill Alias'
      tags 'SkillAliases'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :skill_alias_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/SkillAliasUpdateRequest' },
                required: true

      response '200', 'Skill Alias Updated' do
        schema '$ref' => '#/components/schemas/SkillAliasResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'admin_roles',
            attributes: {
              name: 'Skill XYZ',
              client_id: '1',
              skill_id: '1'
            }
          }
        }]

        let(:body) do
          {
            data: {
              id: skill_alias_id.to_s,
              type: 'skill_aliases',
              attributes: {
                name: 'Skill PQR',
                skill_id: skill_id.to_s
              }
            }
          }
        end

        run_test! do |response|
          skill_alias_response = JSON.parse(response.body)['data']
          expect(skill_alias_response).to have_key('id')
          expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
          expect(skill_alias_response).to have_attribute(:name).with_value('Skill PQR')
          expect(skill_alias_response).to have_attribute(:client_id).with_value(client_id.to_s)
        end
      end
    end

    delete 'Delete Skill Alias' do
      operationId 'DeleteSkillAlias'
      description 'Delete Skill Alias'
      tags 'SkillAliases'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :skill_alias_id, in: :path, type: :string

      response '204', 'Skill Alias Deleted' do
        run_test! do |response|
          expect(response.body).to be_empty
          expect(SkillAlias.find_by(id: skill_alias_id)).to eq(nil)
        end
      end
    end
  end
end
