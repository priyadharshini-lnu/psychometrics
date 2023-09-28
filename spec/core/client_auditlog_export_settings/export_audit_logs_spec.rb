# frozen_string_literal: true

require 'rails_helper'

describe ClientAuditlogExportSettings::ExportAuditLogs do
  let(:last_exported_at) { nil }
  let(:client_auditlog_export_setting) do
    create(:client_auditlog_export_setting, destination_type: :s3, active: true, s3_bucket_folder: 'folder',
s3_bucket_name: 'name', s3_access_key_id: 'id', s3_secret_access_key: 'secret', last_exported_at:)
  end
  let(:client) { client_auditlog_export_setting.client }
  let(:current_time) { Time.zone.local(2024, 8, 11, 10, 30, 0) }
  let(:yesterday) { current_time - 1.day }

  before do
    allow(Time).to receive(:current).and_return(current_time)
    allow(ClientAuditlogExportSettings::S3::UploadStream).to receive(:call) do |_setting, query, _name|
      { ok: query.count }
    end
    create(:audit_log, client:, action: 'dummy', created_at: yesterday)
    create(:audit_log, client: create(:tenancy), action: 'dummy', created_at: yesterday)
    create(:audit_log, client:, action: 'dummy', created_at: yesterday - 1.day)
    create(:audit_log, client:, action: 'dummy', created_at: yesterday - 2.days)
  end

  context 'when last_exported_at is NULL' do
    it 'exports all existing audit logs' do
      result = described_class.call(client_auditlog_export_setting)
      expect(result[:ok]).to eq(3)
    end

    it 'updates `last_exported_at` in settings' do
      described_class.call(client_auditlog_export_setting)

      expect(client_auditlog_export_setting.reload.last_exported_at).to eq(current_time)
    end

    context 'when destination type is s3' do
      it 'calls S3::UploadStream service' do
        described_class.call!(client_auditlog_export_setting)
        expect(ClientAuditlogExportSettings::S3::UploadStream).to have_received(:call).
          with(client_auditlog_export_setting, anything, "folder/2024/08/11/AuditLog-#{client.id}-1723357800000.json")
      end
    end
  end

  context 'when last_exported_at > current time)' do
    let(:last_exported_at) { current_time + 1.second }
    it 'does not export anything' do
      result = described_class.call(client_auditlog_export_setting)

      expect(result[:ok]).to eq(:noop)
    end
  end

  context 'when last_exported_at is yesterday' do
    let(:last_exported_at) { yesterday }
    it 'export only logs since yesterday' do
      result = described_class.call(client_auditlog_export_setting)
      expect(result[:ok]).to eq(1)
    end
  end
end
