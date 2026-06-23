# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ClientAuditlogExportSettingsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:client) { create(:tenancy) }
  let(:settings) do
    create(:client_auditlog_export_setting, s3_secret_access_key: 'secret', description: 'desc', client: client)
  end
  before { sign_in(superadmin) }

  describe 'POST /client_auditlog_export_setting/{id}/test_connection' do
    context 'when connection is valid' do
      before do
        allow(ClientAuditlogExportSettings::TestConnection).to receive(:call).and_return({ ok: 'ok' })
      end

      it 'returns client_auditlog_export_setting object' do
        post "/api/v2/administration/clients/#{client.id}/client_auditlog_export_settings/#{settings.id}/test_connection" # rubocop:disable Layout/LineLength
        data = JSON.parse(response.body)['data']
        expect(data['id']).to eq(settings.id.to_s)
      end
    end

    context 'when connection is invalid' do
      before do
        allow(ClientAuditlogExportSettings::TestConnection).to receive(:call).and_return(error: :invalid_aws_connection)
      end

      it 'returns client_auditlog_export_setting object' do
        post "/api/v2/administration/clients/#{client.id}/client_auditlog_export_settings/#{settings.id}/test_connection" # rubocop:disable Layout/LineLength
        errors = JSON.parse(response.body)['errors'].first
        expect(errors).to eq('code' => 'invalid_aws_connection')
      end
    end
  end

  describe 'GET /clients/{client_id}/client_auditlog_export_settings/create_or_get' do
    context 'when auditlog does not exist' do
      it 'returns new auditlog export setting' do
        get "/api/v2/administration/clients/#{client.id}/client_auditlog_export_settings/create_or_get"

        data = JSON.parse(response.body)['data']
        attrs = data['attributes']

        expect(data['id']).not_to be_nil
        expect(data.dig('relationships', 'client', 'data', 'id')).to eq(client.id.to_s)
        expect(attrs['destination_type']).to eq('s3')
      end
    end

    context 'when auditlog exists' do
      before do
        create(:client_auditlog_export_setting, s3_secret_access_key: 'secret', description: 'desc', client: client)
      end

      it 'returns this auditlog export setting' do
        get "/api/v2/administration/clients/#{client.id}/client_auditlog_export_settings/create_or_get"

        data = JSON.parse(response.body)['data']
        attrs = data['attributes']

        expect(data['id']).not_to be_nil
        expect(attrs['description']).to eq('desc')
      end

      it 'does not return s3_secret_access_key' do
        get "/api/v2/administration/clients/#{client.id}/client_auditlog_export_settings/create_or_get"

        data = JSON.parse(response.body)['data']
        attrs = data['attributes']

        expect(attrs['s3_secret_access_key']).to eq('<FILTERED>')
      end
    end
  end
end
