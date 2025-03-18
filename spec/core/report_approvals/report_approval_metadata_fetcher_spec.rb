# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportApprovals::ReportApprovalMetadataFetcher, type: :command do
  let!(:client_admins) { create_list(:client_admin, 3) }
  let!(:ras1) do
    create(:report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id])
  end

  let!(:ras2) do
    create(:report_approval_setting, qc_user_ids: [client_admins[2].id], approver_user_ids: [client_admins[1].id])
  end

  let!(:ras1_report_approval) do
    create(:report_approval,
           campaign_id: ras1.campaign_id,
           report_id: ras1.report_id,
           qc_user_id: client_admins[0].id,
           approver_user_id: client_admins[1].id,
           approval_status: 'approved')
  end

  let!(:ras2_report_approval) do
    create(:report_approval,
           campaign_id: ras2.campaign_id,
           report_id: ras2.report_id,
           qc_user_id: client_admins[2].id,
           approver_user_id: client_admins[1].id,
           approval_status: 'pending_qc')
  end

  describe '#call' do
    context 'without filters' do
      it 'returns the correct metadata' do
        result = described_class.call!(client_admins[0])

        expect(result).to eq(
          {
            campaigns: [{ 'id' => ras1.campaign.id, 'name' => ras1.campaign.name }],
            reports: [{ 'id' => ras1.report.id, 'name' => ras1.report.name }],
            qc_users: [{ 'id' => client_admins[0].id, 'name' => client_admins[0].decorate.display_name }],
            approvers: [{ 'id' => client_admins[1].id, 'name' => client_admins[1].decorate.display_name }]
          }
        )
      end
    end

    context 'with my_tasks filter' do
      let(:filter) { { my_tasks: 'true' } }

      it 'returns only the tasks assigned to the current user' do
        ras1_report_approval.update!(approval_status: 'pending_qc')
        result = described_class.call!(client_admins[0], filter: filter)

        expect(result).to eq(
          {
            campaigns: [{ 'id' => ras1.campaign.id, 'name' => ras1.campaign.name }],
            reports: [{ 'id' => ras1.report.id, 'name' => ras1.report.name }],
            qc_users: [{ 'id' => client_admins[0].id, 'name' => client_admins[0].decorate.display_name }],
            approvers: [{ 'id' => client_admins[1].id, 'name' => client_admins[1].decorate.display_name }]
          }
        )
      end
    end

    context 'with approval_status_in filter' do
      let(:filter) { { approval_status_in: 'approved' } }

      it 'returns only the approved report approvals' do
        result = described_class.call!(client_admins[0], filter: filter)

        expect(result).to eq(
          {
            campaigns: [{ 'id' => ras1.campaign.id, 'name' => ras1.campaign.name }],
            reports: [{ 'id' => ras1.report.id, 'name' => ras1.report.name }],
            qc_users: [{ 'id' => client_admins[0].id, 'name' => client_admins[0].decorate.display_name }],
            approvers: [{ 'id' => client_admins[1].id, 'name' => client_admins[1].decorate.display_name }]
          }
        )
      end
    end
  end
end
