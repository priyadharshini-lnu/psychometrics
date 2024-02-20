# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClientAuditlogExportSettings::AuditLogObject do
  describe '#call' do
    let(:audit_log) { create(:audit_log) }
    let(:audit_log_with_model_changes) { create(:audit_log, :with_active_record_audits) }
    let(:request_log_response_keys) do
      %i[id log_type request_uuid user_id record_id record_type action payload client_ip
         outcome failure_reason interface user_agent]
    end
    let(:model_log_response_keys) do
      %i[id log_type request_uuid record_id record_type old_value new_value]
    end
    let(:request_log_response_values) do
      [
        audit_log.id, 'request', audit_log.request_uuid, audit_log.user_id, audit_log.record_id,
        audit_log.record_type, audit_log.action, audit_log.payload, audit_log.client_ip,
        audit_log.outcome, audit_log.failure_reason, audit_log.interface, audit_log.user_agent
      ]
    end

    context 'with request audit_logs' do
      it 'should extract request audit logs ' do
        result = described_class.call(audit_log)
        response = result[:ok]

        expect(response).to be_an(Array)
        expect(response.first.keys).to match_array(request_log_response_keys)
        expect(response.first.values).to match_array(request_log_response_values)
      end
    end

    context 'with request and active record audit_logs' do
      it 'should extract model changes' do
        result = described_class.call(audit_log_with_model_changes)
        response = result[:ok]

        expect(response).to be_an(Array)
        expect(response.first.keys).to match_array(request_log_response_keys)
        expect(response.second.keys).to match_array(model_log_response_keys)
      end
    end
  end
end
