# frozen_string_literal: true

require 'rails_helper'
require_relative '../concerns/filter_by_tags_shared_examples'

RSpec.describe Api::V2::Administration::AssessmentsController, type: :request do
  let!(:assessment) { create(:assessment) }
  let!(:superadmin) { create(:superadmin) }
  let(:dimension) { create(:dimension) }
  let(:client) { create(:tenancy) }
  let!(:pearson_assessment) do
    create(:pearson_assessment,
           product_id: 'pearson_id',
           norms: {
             'items' => [
               {
                 'normId' => 'n1',
                 'label' => 'norm1',
                 'supportedLanguage' => 'fr'
               },
               {
                 'normId' => 'n2',
                 'label' => 'norm2',
                 'supportedLanguage' => 'no'
               }
             ]
           })
  end

  before(:each) { sign_in(superadmin) }
  after(:each) { sign_out(superadmin) }

  describe 'Create Pearson Assessment' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          type: 'assessments',
          attributes: {
            name: 'name',
            disabled: false,
            type: 'pearson',
            category: 'pearson',
            description: 'asd',
            external_settings: {
              assessment_id: 'pearson_id',
              norm_id: 'n1'
            },
            extra: { icon_color: 'color' },
            tag_list: ['pearson']
          },
          relationships: {
            dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
            owner: { data: { type: 'clients', id: client.id.to_s } }
          }
        }
      )
      post '/api/v2/administration/assessments', params: params,
       headers: { 'Content-type': 'application/vnd.api+json' }

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(201)
      expect(parsed_response['data']).to have_key('attributes')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'norm_id')).to eq('n1')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_id')).to eq('pearson_id')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_language')).to eq('fr')
      expect(parsed_response.dig('data', 'attributes', 'tag_list')).to eq(['pearson'])
    end

    context 'if norm_id is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'pearson',
              category: 'pearson',
              description: 'asd',
              external_settings: {
                assessment_id: 'pearson_id',
                norm_id: 'invalid'
              }
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
          }
        )
        post '/api/v2/administration/assessments', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/external_settings/norm_id')
      end
    end

    context 'if assessment_id is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'pearson',
              category: 'pearson',
              description: 'asd',
              external_settings: {
                assessment_id: 'invalid'
              }
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
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

    context 'if category is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'pearson',
              category: 'saville',
              description: 'asd',
              external_settings: {
                assessment_id: 'pearson_id'
              }
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
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
              type: 'pearson',
              category: 'pearson',
              description: 'asd',
              external_settings: {}
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
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

  describe 'Update Pearson Assessment' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          id: assessment.id.to_s,
          type: 'assessments',
          attributes: {
            name: 'name',
            disabled: false,
            type: 'pearson',
            category: 'pearson',
            description: 'asd',
            external_settings: {
              assessment_id: 'pearson_id',
              norm_id: 'n2'
            }
          },
          relationships: {
            dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
            owner: { data: { type: 'clients', id: client.id.to_s } }
          }
        }
      )
      put "/api/v2/administration/assessments/#{assessment.id}", params: params,
       headers: { 'Content-type': 'application/vnd.api+json' }

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(200)
      expect(parsed_response['data']).to have_key('attributes')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'norm_id')).to eq('n2')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_id')).to eq('pearson_id')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'assessment_language')).to eq('no')
    end
  end

  describe 'Filter by tags' do
    include_examples 'Filter by tags', Assessment
  end
end
