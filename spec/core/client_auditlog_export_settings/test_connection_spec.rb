# frozen_string_literal: true

require 'rails_helper'

describe ClientAuditlogExportSettings::TestConnection do
  let(:last_exported_at) { nil }
  let(:client_auditlog_export_setting) do
    create(:client_auditlog_export_setting, destination_type: :s3, active: true, s3_bucket_folder: 'folder',
s3_bucket_name: 'name', s3_access_key_id: 'id', s3_region: 'us-east-1', s3_secret_access_key: 'secret',
last_exported_at:)
  end
  let(:aws_object) { double('aws_object') }
  let(:client) { client_auditlog_export_setting.client }
  let(:current_time) { Time.zone.local(2024, 8, 11, 10, 30, 0) }
  let(:yesterday) { current_time - 1.day }

  context 'when the AWS connection is invalid' do
    it 'returns the error :invalid_aws_connection' do
      allow(ClientAuditlogExportSettings::S3::BuildObject).to receive(:call).and_raise(Aws::Errors::ServiceError)

      result = described_class.call(client_auditlog_export_setting)
      expect(result[:error]).to eq(:invalid_aws_connection)
    end
  end

  context 'when the AWS connection is valid' do
    before do
      allow(aws_object).to receive(:upload_file)
      allow(ClientAuditlogExportSettings::S3::BuildObject).to receive(:call).and_return(ok: aws_object)
    end
    it 'returns the error :invalid_aws_connection' do
      result = described_class.call(client_auditlog_export_setting)
      expect(result).to have_key(:ok)
    end
  end
end
