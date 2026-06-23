# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillAliasesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
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

  describe 'GET /api/v2/administration/clients/{client_id}/skill_aliases' do
    it 'returns skill alias list' do
      get "/api/v2/administration/clients/#{client_id}/skill_aliases"

      expect(response).to have_http_status(200)
      skill_aliases_response = JSON.parse(response.body)['data'].find { |d| d['id'] == skill_alias.id.to_s }
      expect(skill_aliases_response).to have_attribute(:name).with_value(skill_alias.name)
      expect(skill_aliases_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
      expect(skill_aliases_response).to have_attribute(:client_id).with_value(client_id.to_s)
    end
  end

  describe 'POST /api/v2/administration/clients/{client_id}/skill_aliases' do
    it 'creates a new skill alias' do
      body = {
        data: {
          type: 'skill_aliases',
          attributes: {
            name: 'Skill XYZ',
            skill_id: skill_id_two.to_s
          }
        }
      }

      post "/api/v2/administration/clients/#{client_id}/skill_aliases", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(201)
      skill_alias_response = JSON.parse(response.body)['data']
      expect(skill_alias_response).to have_key('id')
      expect(skill_alias_response).to have_attribute(:name).with_value('Skill XYZ')
      expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id_two.to_s)
    end
  end

  describe 'GET /api/v2/administration/clients/{client_id}/skill_aliases/{skill_alias_id}' do
    it 'returns a specific skill alias' do
      get "/api/v2/administration/clients/#{client_id}/skill_aliases/#{skill_alias_id}"

      expect(response).to have_http_status(200)
      skill_alias_response = JSON.parse(response.body)['data']
      expect(skill_alias_response).to have_key('id')
      expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
      expect(skill_alias_response).to have_attribute(:name).with_value(skill_alias.name)
      expect(skill_alias_response).to have_attribute(:client_id).with_value(client_id.to_s)
    end
  end

  describe 'PATCH /api/v2/administration/clients/{client_id}/skill_aliases/{skill_alias_id}' do
    it 'updates a skill alias' do
      body = {
        data: {
          id: skill_alias_id.to_s,
          type: 'skill_aliases',
          attributes: {
            name: 'Skill PQR',
            skill_id: skill_id.to_s
          }
        }
      }

      patch "/api/v2/administration/clients/#{client_id}/skill_aliases/#{skill_alias_id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(200)
      skill_alias_response = JSON.parse(response.body)['data']
      expect(skill_alias_response).to have_key('id')
      expect(skill_alias_response).to have_attribute(:skill_id).with_value(skill_id.to_s)
      expect(skill_alias_response).to have_attribute(:name).with_value('Skill PQR')
      expect(skill_alias_response).to have_attribute(:client_id).with_value(client_id.to_s)
    end
  end

  describe 'DELETE /api/v2/administration/clients/{client_id}/skill_aliases/{skill_alias_id}' do
    it 'deletes a skill alias' do
      delete "/api/v2/administration/clients/#{client_id}/skill_aliases/#{skill_alias_id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(204)
      expect(response.body).to be_empty
      expect(SkillAlias.find_by(id: skill_alias_id)).to eq(nil)
    end
  end
end
