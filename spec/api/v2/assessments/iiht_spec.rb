# frozen_string_literal: true

require 'rails_helper'
require_relative '../concerns/filter_by_tags_shared_examples'

RSpec.describe Api::V2::Administration::AssessmentsController, type: :request do
  let!(:assessment) { create(:assessment) }
  let!(:superadmin) { create(:superadmin) }
  let(:dimension) { create(:dimension) }
  let(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: client) }
  let!(:integration) { create(:integration, project: project, name: :iiht, config: {}) }
  let(:assessments_response) do
    [{ 'assessmentIdNumber' => 'fake_id', 'name' => 'testName', 'description' => 'description1' }]
  end
  let(:relations) do
    {
      dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
      project: { data: { type: 'clients', id: project.id.to_s } },
      owner: { data: { type: 'clients', id: client.id.to_s } }
    }
  end

  before(:each) { sign_in(superadmin) }
  after(:each) { sign_out(superadmin) }
  before do
    allow(Iiht::GetAssessments).to receive(:call!).and_return(assessments_response)
  end

  describe 'Create IIHT Assessment' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          type: 'assessments',
          attributes: {
            name: 'name',
            disabled: false,
            type: 'iiht',
            category: 'iiht',
            description: 'asd',
            external_settings: {
              assessment_id: 'fake_id'
            },
            extra: { icon_color: 'color' },
            tag_list: %w[iiht assessments]
          },
          relationships: relations
        }
      )
      post '/api/v2/administration/assessments', params: params,
       headers: { 'Content-type': 'application/vnd.api+json' }

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(201)
      expect(parsed_response['data']).to have_key('attributes')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'schedule_config')).to eq('{}')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_id')).to eq('fake_id')
      expect(parsed_response.dig('data', 'attributes', 'tag_list')).to eq(%w[iiht assessments])
    end

    context 'if schedule_config is not JSON' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'iiht',
              category: 'iiht',
              description: 'asd',
              external_settings: {
                assessment_id: 'fake_id',
                schedule_config: { d: 1 }
              }
            },
            relationships: relations
          }
        )
        post '/api/v2/administration/assessments', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/external_settings/schedule_config')
      end
    end

    context 'if category is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'iiht',
              category: 'saville',
              description: 'asd',
              external_settings: {
                assessment_id: 'fake_id'
              }
            },
            relationships: relations
          }
        )
        post '/api/v2/administration/assessments', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/category')
      end
    end

    context 'if assessment_id is not passed' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'iiht',
              category: 'iiht',
              description: 'asd',
              external_settings: {}
            },
            relationships: relations
          }
        )
        post '/api/v2/administration/assessments', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/external_settings/assessment_id')
      end
    end
  end

  describe 'Update IIHT Assessment' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          id: assessment.id.to_s,
          type: 'assessments',
          attributes: {
            name: 'name',
            disabled: false,
            type: 'iiht',
            category: 'iiht',
            description: 'asd',
            external_settings: {
              assessment_id: 'fake_id',
              schedule_config: '{"a": 11}'
            }
          },
          relationships: relations
        }
      )
      put "/api/v2/administration/assessments/#{assessment.id}", params: params,
       headers: { 'Content-type': 'application/vnd.api+json' }

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(200)
      expect(parsed_response['data']).to have_key('attributes')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'schedule_config')).to eq('{"a":11}')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_id')).to eq('fake_id')
    end
  end

  describe 'Filter by tags' do
    include_examples 'Filter by tags', Assessment
  end
end
