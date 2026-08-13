# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveRecordAuditLogs::RecordHistorySearch do
  let(:record_id) { 999_999 }

  def search(params)
    described_class.new(params).call
  end

  def serialized(result)
    JSON.parse(result[:list].to_json)
  end

  describe '#call' do
    it 'returns an empty result when no record is specified' do
      result = search({})

      expect(result[:list]).to eq([])
      expect(result[:total]).to eq(0)
    end

    context 'when a record is specified' do
      let!(:audit) do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id,
                                     action: 'update', audited_changes: { 'name' => %w[old new] }, version: 2)
      end

      it 'returns the record audits with available types and fields' do
        result = search(record_type: 'Dimension', record_id: record_id)

        expect(result[:total]).to eq(1)
        expect(serialized(result).first['id']).to eq(audit.id)
        expect(result[:types]).to include('Dimension')
        expect(result[:fields]).to include('name')
      end

      it 'reads string-keyed params as delivered by the async job' do
        result = search('record_type' => 'Dimension', 'record_id' => record_id.to_s)

        expect(result[:total]).to eq(1)
        expect(serialized(result).first['id']).to eq(audit.id)
      end

      it 'filters by changed field' do
        expect(search(record_type: 'Dimension', record_id: record_id, changed_field: 'name')[:total]).to eq(1)
        expect(search(record_type: 'Dimension', record_id: record_id, changed_field: 'missing')[:total]).to eq(0)
      end
    end

    context 'when a date range is applied' do
      let!(:recent_audit) do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id, created_at: 1.day.ago)
      end

      before do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id, created_at: 20.days.ago)
      end

      it 'defaults to the last 7 days when no dates are provided' do
        result = search(record_type: 'Dimension', record_id: record_id)

        expect(serialized(result).pluck('id')).to contain_exactly(recent_audit.id)
      end

      it 'raises when the range is wider than the maximum' do
        expect do
          search(record_type: 'Dimension', record_id: record_id,
                 start_date: 60.days.ago.iso8601, end_date: Time.zone.now.iso8601)
        end.to raise_error(ActiveRecordAuditLogs::HistoryDateRange::Error)
      end
    end

    context 'when the change is linked to an audit log' do
      let(:uuid) { SecureRandom.uuid }
      let!(:audit_log) { create(:audit_log, request_uuid: uuid) }
      let!(:audit) do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id, request_uuid: uuid)
      end

      it 'exposes the connected audit_log_id' do
        entry = serialized(search(record_type: 'Dimension', record_id: record_id)).find { |e| e['id'] == audit.id }

        expect(entry['request_uuid']).to eq(uuid)
        expect(entry['audit_log_id']).to eq(audit_log.id)
      end
    end

    context 'when tracing by request_uuid' do
      let(:uuid) { SecureRandom.uuid }
      let!(:audit_one) do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id, request_uuid: uuid)
      end
      let!(:audit_two) do
        create(:active_record_audit, auditable_type: 'Report', auditable_id: 888_888, request_uuid: uuid)
      end

      it 'returns every record changed in that request' do
        result = search(request_uuid: uuid)

        expect(serialized(result).pluck('id')).to contain_exactly(audit_one.id, audit_two.id)
      end

      it 'allows request tracing when tenant audits are not geo-restricted' do
        tenant_one = create(:tenancy)
        tenant_two = create(:tenancy)

        audit_one.update!(tenant_id: tenant_one.id)
        audit_two.update!(tenant_id: tenant_two.id)

        expect { search(request_uuid: uuid) }.not_to raise_error
      end
    end

    context 'when page size is invalid' do
      before do
        create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id)
      end

      it 'falls back to default size for zero or negative values' do
        result_zero = search(record_type: 'Dimension', record_id: record_id, size: 0)
        result_negative = search(record_type: 'Dimension', record_id: record_id, size: -5)

        expect(result_zero[:list].size).to eq(1)
        expect(result_negative[:list].size).to eq(1)
      end
    end
  end
end
