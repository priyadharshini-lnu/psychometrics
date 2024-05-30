# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ExternalReportsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:hogan_assessment) { create(:hogan_assessment, external_settings: { assessment_id: 'HPI' }) }
  let!(:saville_assessment) do
    create(:assessment, :saville, external_settings: { assessment_id: 'a830e4ab-bc66-4238-92e0-6e6fd3fd1edf' })
  end
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/external_reports/' do
    get 'External Report List for Hogan' do
      operationId 'ExternalReportList'
      tags 'ExternalReports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :'filter[type_eq]', in: :query, required: true
      parameter name: :'filter[assessment_ids_in]', in: :query, required: false

      response '200', 'External Report list' do
        schema '$ref' => '#/components/schemas/ExternalReportListResponse'

        examples 'application/json' => [{
          type: 'external_reports',
          data: {
            id: '770',
            attributes: {
              name: 'report#1'
            }
          }
        }]

        let(:'filter[type_eq]') { 'hogan' }
        let(:'filter[assessment_ids_in]') { hogan_assessment.id }

        run_test! do |response|
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response.length).to eq(3)
          expect(parsed_response.first).to have_key('id')
          expect(parsed_response.first).to have_attribute(:name).with_value('HPI Data Report')
        end
      end
    end

    get 'External Report List for Saville' do
      operationId 'ExternalReportList'
      tags 'ExternalReports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :'filter[type_eq]', in: :query, required: true
      parameter name: :'filter[assessment_ids_in]', in: :query, required: false

      response '200', 'External Report list' do
        schema '$ref' => '#/components/schemas/ExternalReportListResponse'

        examples 'application/json' => [{
          type: 'external_reports',
          data: {
            id: '770',
            attributes: {
              name: 'report#1'
            }
          }
        }]

        let(:'filter[type_eq]') { 'saville' }
        let(:'filter[assessment_ids_in]') { saville_assessment.id }

        run_test! do |response|
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response.length).to eq(15)
          expect(parsed_response.first).to have_key('id')
          expect(parsed_response.first).to have_attribute(:name).
            with_value('Wave Focus Styles Building Resilient Agility Report V4')
        end
      end
    end
  end
end
