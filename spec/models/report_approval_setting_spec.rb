# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportApprovalSetting, type: :model do
  let(:client_admins) { create_list(:client_admin, 3) }

  describe '.for_user' do
    it 'returns report_approval_setting if user is a qc or approver' do
      ras1 = create(
        :report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id]
      )
      ras2 = create(
        :report_approval_setting, qc_user_ids: [client_admins[1].id], approver_user_ids: [client_admins[2].id]
      )

      expect(ReportApprovalSetting.for_user(client_admins[0].id)).to match_array([ras1])
      expect(ReportApprovalSetting.for_user(client_admins[1].id)).to match_array([ras1, ras2])
      expect(ReportApprovalSetting.for_user(client_admins[2].id)).to match_array([ras2])
    end
  end

  describe '.report_approvals' do
    let(:ras1) do
      create(:report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id])
    end
    let(:ras2) do
      create(:report_approval_setting, qc_user_ids: [client_admins[1].id], approver_user_ids: [client_admins[2].id])
    end
    let(:ras1_report_approval) { create(:report_approval, campaign_id: ras1.campaign_id, report_id: ras1.report_id) }
    let(:ras2_report_approval) { create(:report_approval, campaign_id: ras2.campaign_id, report_id: ras2.report_id) }

    before do
      create(:user_report, campaign_id: ras1.campaign_id)
      create(:user_report, report_id: ras1.report_id)
    end

    it 'returns report approval if user is a qc or approver' do
      expect(ReportApprovalSetting.report_approvals(client_admins[0])).to match_array([ras1_report_approval])
      expect(ReportApprovalSetting.report_approvals(client_admins[1])).to match_array(
        [ras1_report_approval, ras2_report_approval]
      )
      expect(ReportApprovalSetting.report_approvals(client_admins[2])).to match_array([ras2_report_approval])
    end

    it 'returns all the report approval for super admin' do
      super_admin = create(:superadmin)
      expect(ReportApprovalSetting.report_approvals(super_admin)).to match_array(
        [ras1_report_approval, ras2_report_approval]
      )
    end
  end

  describe '.user_tasks' do
    it 'returns report approval if user is a qc and qc is pending' do
      ras = create(:report_approval_setting, qc_user_ids: [client_admins[0].id])
      ras_report_approval1 = create(
        :report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id, approval_status: :pending_qc
      )
      create(
        :report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id, approval_status: :not_ready
      )

      expect(ReportApprovalSetting.user_tasks(client_admins[0])).to match_array([ras_report_approval1])
    end

    it 'returns report approval if user is a approver and approval is pending' do
      ras = create(:report_approval_setting, approver_user_ids: [client_admins[0].id])
      ras_report_approval1 = create(
        :report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id, approval_status: :qc_completed
      )
      create(
        :report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id, approval_status: :not_ready
      )

      expect(ReportApprovalSetting.user_tasks(client_admins[0])).to match_array([ras_report_approval1])
    end
  end
end
