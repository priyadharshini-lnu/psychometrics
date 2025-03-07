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
           approver_user_id: client_admins[1].id)
  end

  let(:fetcher) { described_class.call!(client_admins[0]) }

  describe '#call' do
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
end
