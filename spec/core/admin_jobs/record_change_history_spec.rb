# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::RecordChangeHistory do
  let(:owner) { create(:superadmin) }
  let(:assessment) { create(:assessment) }

  describe '.validate' do
    it 'raises when record_type is missing' do
      expect { described_class.validate({ record_id: assessment.id }, owner) }.
        to raise_error(described_class::Error, 'record_type is required')
    end

    it 'raises when record_id is missing' do
      expect { described_class.validate({ record_type: 'Assessment' }, owner) }.
        to raise_error(described_class::Error, 'record_id is required')
    end

    it 'raises when the record type is invalid' do
      expect { described_class.validate({ record_type: 'NotARealClass', record_id: 1 }, owner) }.
        to raise_error(described_class::Error, /Invalid record type/)
    end

    it 'raises when the record is not found' do
      expect { described_class.validate({ record_type: 'Assessment', record_id: -1 }, owner) }.
        to raise_error(described_class::Error, /Record not found/)
    end

    it 'raises when end_date precedes start_date' do
      expect do
        described_class.validate(
          { record_type: 'Assessment', record_id: assessment.id,
            start_date: Time.zone.now.iso8601, end_date: 1.day.ago.iso8601 },
          owner
        )
      end.to raise_error(described_class::Error, /on or after the start date/)
    end

    it 'raises when the date range exceeds the maximum span' do
      expect do
        described_class.validate(
          { record_type: 'Assessment', record_id: assessment.id,
            start_date: 60.days.ago.iso8601, end_date: Time.zone.now.iso8601 },
          owner
        )
      end.to raise_error(described_class::Error, /cannot exceed/)
    end

    it 'passes for a valid record without a date range' do
      expect { described_class.validate({ record_type: 'Assessment', record_id: assessment.id }, owner) }.
        not_to raise_error
    end
  end

  describe '#call' do
    let(:uuid) { SecureRandom.uuid }
    let!(:audit_log) { create(:audit_log, request_uuid: uuid) }
    let!(:audit) do
      create(:active_record_audit, auditable_type: 'Assessment', auditable_id: assessment.id,
                                   action: 'update', audited_changes: { 'name' => %w[a b] },
                                   user: owner, request_uuid: uuid)
    end

    let(:job_record) do
      create(:admin_job_record, operation: :superadmin_record_change_history, owner: owner,
                                data: { 'record_type' => 'Assessment', 'record_id' => assessment.id })
    end

    it 'writes a CSV of the record audits including version, request and audit log' do
      tenant = create(:tenancy)
      audit.update!(tenant_id: tenant.id)

      described_class.call!(job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      expect(csv.first).to eq(described_class::HEADERS)

      row = csv.drop(1).find { |columns| columns[0].to_s == audit.id.to_s }
      expect(row).to be_present

      header = described_class::HEADERS
      expect(row[header.index('Version')]).to eq(audit.reload.version.to_s)
      expect(row[header.index('Request UUID')]).to eq(uuid)
      expect(row[header.index('Audit Log ID')]).to eq(audit_log.id.to_s)
    end

    it 'respects changed field filter used by the UI' do
      changed_field = 'ui_changed_field_for_record_change_history_spec'
      matching_user = create(:superadmin, email: 'matching.user@example.com')
      other_user = create(:superadmin, email: 'other.user@example.com')

      matching_audit_log = create(:audit_log, user: matching_user)
      non_matching_audit_log = create(:audit_log, user: other_user)

      matching_audit = create(
        :active_record_audit,
        auditable_type: 'Assessment',
        auditable_id: assessment.id,
        action: 'update',
        audited_changes: { changed_field => %w[before after] },
        user: matching_user,
        request_uuid: matching_audit_log.request_uuid
      )

      create(
        :active_record_audit,
        auditable_type: 'Assessment',
        auditable_id: assessment.id,
        action: 'update',
        audited_changes: { 'description' => %w[old new] },
        user: other_user,
        request_uuid: non_matching_audit_log.request_uuid
      )

      filtered_job_record = create(
        :admin_job_record,
        operation: :superadmin_record_change_history,
        owner: owner,
        data: {
          'record_type' => 'Assessment',
          'record_id' => assessment.id,
          'changed_field' => changed_field
        }
      )

      described_class.call!(filtered_job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(filtered_job_record.file))
      rows = csv.drop(1)

      expect(rows.map { |columns| columns[0].to_s }).to contain_exactly(matching_audit.id.to_s)
    end
  end
end
