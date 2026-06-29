# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AssessmentsController, type: :request do
  let!(:assessment) { create(:hogan_assessment, external_settings: { assessment_id: 'HPI' }) }
  let!(:superadmin) { create(:superadmin) }
  let(:dimension) { create(:dimension) }
  let(:client) { create(:tenancy) }

  before(:each) { sign_in(superadmin) }
  after(:each) { sign_out(superadmin) }

  describe 'Create Hogan Report' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          type: 'reports',
          attributes: {
            name: 'name',
            provider: 'hogan',
            description: 'asd',
            external_settings: {
              report_id: 'EcHPIDML'
            },
            icon_color: 'color'
          },
          relationships: {
            assessments: { data: [{ type: 'assessments', id: assessment.id.to_s }] },
            owner: { data: { type: 'clients', id: client.id.to_s } }
          }
        }
      )
      post '/api/v2/administration/reports', params: params,
       headers: { 'Content-type': 'application/vnd.api+json' }

      parsed_response = JSON.parse(response.body)
      expect(response.status).to eq(201)
      expect(parsed_response['data']).to have_key('attributes')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'norm_id')).to eq('Global2023')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'language_id')).to eq('en')
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'report_id')).to eq('EcHPIDML')
    end

    context 'if report_id is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'reports',
            attributes: {
              name: 'name',
              provider: 'hogan',
              description: 'asd',
              external_settings: {
                report_id: 'invalid'
              },
              icon_color: 'color'
            },
            relationships: {
              assessments: { data: [{ type: 'assessments', id: assessment.id.to_s }] },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
          }
        )
        post '/api/v2/administration/reports', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/external_settings/report_id')
      end
    end

    context 'if report_id is not passed' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'reports',
            attributes: {
              name: 'name',
              provider: 'hogan',
              description: 'asd',
              external_settings: {},
              icon_color: 'color'
            },
            relationships: {
              assessments: { data: [{ type: 'assessments', id: assessment.id.to_s }] },
              owner: { data: { type: 'clients', id: client.id.to_s } }
            }
          }
        )
        post '/api/v2/administration/reports', params: params,
         headers: { 'Content-type': 'application/vnd.api+json' }

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(422)
        expect(parsed_response.dig('errors', 0, 'source', 'pointer')).
          to eq('/data/attributes/external_settings/report_id')
      end
    end
  end
end
