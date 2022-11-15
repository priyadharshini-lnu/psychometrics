# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ReportsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/reports/' do
    get 'Report List' do
      operationId 'ReportList'
      description <<~HEREDOC
        Fetch Report List

        **Supported Filter Query Parameter**

        | Filter        | Description   |
        | ------------- |:-------------:|
        | filter[name_cont]     | Returns report whose name matches the passed filter value |
      HEREDOC
      tags 'Report'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Report list' do
        let!(:report) { create(:report) }

        schema '$ref' => '#/components/schemas/ReportListResponse'

        examples 'application/json' => [{
          type: 'reports',
          data: {
            id: '770',
            attributes: {
              name: 'Report Name'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          report_response = data.find { |d| d['id'] == report.id.to_s }
          expect(report_response).to have_key('id')
          expect(report_response).to have_attribute(:name).with_value(report.name)
        end
      end
    end
  end
end
