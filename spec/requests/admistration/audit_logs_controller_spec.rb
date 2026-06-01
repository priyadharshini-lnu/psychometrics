# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::AuditLogsController, type: :request do
  let(:current_user) { create(:superadmin) }
  let(:params) { { page: 1, size: 25, format: :json } }
  let(:response_keys) do
    %w[
      id action campaign_id client_id payload project_id user_id created_at request_uuid
      client project campaign user record_id record_type request active_record_audits
      client_ip interface user_agent outcome failure_reason impersonator
    ]
  end

  before(:each) { login_user(current_user) }

  describe 'GET /administration/audit_logs' do
    context 'with signin request audit' do
      it 'returns list of audits' do
        get administration_audit_logs_path, params: params

        expect(response).to have_http_status(:success)
        expect(json_response['total']).to eq(1)
        expect(json_response['list']).to be_an(Array)

        audit_entry = json_response['list'].last
        expect(audit_entry['action']).to eq('sign_in')

        expect(json_response['types']).to eq([])
        expect(json_response['actions']).to eq([])
      end
    end

    context 'with signin request and dimension create audit' do
      let!(:dimension) { create(:dimension, :with_audit_log) }

      it 'returns list of audits' do
        get administration_audit_logs_path, params: params

        expect(response).to have_http_status(:success)

        expect(json_response['total']).to eq(2)
        expect(json_response['list']).to be_an(Array)

        audit_entry = json_response['list'].find { |r| r['record_type'] == 'Dimension' }
        expect(audit_entry['record_id']).to eq(dimension.id)
        expect(audit_entry['action']).to eq('create')

        expect(json_response['types']).to eq([])
        expect(json_response['actions']).to eq([])
      end
    end
  end

  describe 'GET /administration/audit_logs/:id' do
    context 'with dimension create audit' do
      let!(:dimension) { create(:dimension, :with_audit_log) }
      let(:audit_log_id) { AuditLog.last.id }

      it 'returns audit details' do
        get administration_audit_log_path(audit_log_id), params: { format: :json }

        expect(response).to have_http_status(:success)
        expect(json_response.keys).to match_array(response_keys)
      end
    end
  end
end
