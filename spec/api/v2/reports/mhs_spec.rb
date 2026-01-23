# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AssessmentsController, type: :request do
  let!(:assessment) do
    create(:assessment, :mhs, external_settings: { assessment_id: '9039cce2-6567-4bc5-8655-8792ba9ab936' })
  end
  let!(:superadmin) { create(:superadmin) }
  let(:dimension) { create(:dimension) }
  let(:client) { create(:tenancy) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before(:each) { login_user(superadmin) }
  after(:each) { sign_out(superadmin) }

  describe 'Create Mhs Report' do
    it 'check success response' do
      params = JSON.dump(
        data: {
          type: 'reports',
          attributes: {
            name: 'name',
            provider: 'mhs',
            description: 'asd',
            external_settings: {
              report_id: 'bc791135-086f-4d67-a8c1-cea00c003ded'
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
      expect(parsed_response.dig('data', 'attributes', 'external_settings', 'report_id')).
        to eq('bc791135-086f-4d67-a8c1-cea00c003ded')
    end

    context 'if report_id is invalid' do
      it 'sends validation error' do
        params = JSON.dump(
          data: {
            type: 'reports',
            attributes: {
              name: 'name',
              provider: 'mhs',
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
              provider: 'mhs',
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
