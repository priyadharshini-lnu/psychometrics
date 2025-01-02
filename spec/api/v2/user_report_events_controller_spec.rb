# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe Api::V2::Administration::UserReportEventsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:normal_user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/user_report_events/export' do
    get 'Export UserReportEvents' do
      operationId 'ExportUserReportEvents'
      tags 'UserReportEvents'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :query, type: :string, required: false

      response '200', 'UserReportEvents export initiated' do
        let(:campaign_id) { campaign.id.to_s }

        run_test! do |response|
          expect(response.status).to eq(200)
          expect(JSON.parse(response.body)).to eq('ok')
        end
      end

      response '403', 'Forbidden: Users without admin permissions cannot access' do
        before { sign_in(normal_user) }

        run_test! do |response|
          expect(response.status).to eq(403)
        end
      end
    end
  end
end
