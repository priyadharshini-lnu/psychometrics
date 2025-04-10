# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportApprovals::BulkApprove, type: :command do
  let!(:client_admins) { create_list(:client_admin, 3) }
  describe '#call do not update status when settings off' do
    let!(:ras1) do
      create(:report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id])
    end

    let!(:ra1) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'pending_qc')
    end

    let!(:ra2) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'qc_completed')
    end
    let!(:ra3) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'not_ready')
    end

    context 'with qc1 level' do
      it 'do not change' do
        results, meta = described_class.call!([ra1.id, ra2.id, ra3.id], client_admins[0])

        expect(results).to be_empty
        expect(meta).to eq({ approved: 0, qc_completed: 0, ignored: 1 })
        expect(ra1.reload.approval_status).to eq('pending_qc')
        expect(ra2.reload.approval_status).to eq('qc_completed')
        expect(ra3.reload.approval_status).to eq('not_ready')
      end
    end

    context 'do not change' do
      it 'update only qc related records to next level' do
        results, meta = described_class.call!([ra1.id, ra2.id, ra3.id], client_admins[1])

        expect(results).to be_empty
        expect(meta).to eq({ approved: 0, qc_completed: 0, ignored: 1 })
        expect(ra1.reload.approval_status).to eq('pending_qc')
        expect(ra2.reload.approval_status).to eq('qc_completed')
        expect(ra3.reload.approval_status).to eq('not_ready')
      end
    end
  end

  describe '#call update statuses per role' do
    let!(:ras1) do
      create(:report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id],
             allow_qc_bulk_submit: true, allow_bulk_approve: true)
    end

    let!(:ra1) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'pending_qc')
    end

    let!(:ra2) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'qc_completed')
    end
    let!(:ra3) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             qc_user_id: client_admins[0].id,
             approver_user_id: client_admins[1].id,
             approval_status: 'not_ready')
    end

    context 'with qc1 level' do
      it 'update only this qc related records to next level' do
        results, meta = described_class.call!([ra1.id, ra2.id, ra3.id], client_admins[0])

        expect(results).to eq([ra1])
        expect(meta).to eq({ approved: 0, qc_completed: 1, ignored: 0 })
        expect(ra1.reload.approval_status).to eq('qc_completed')
        expect(ra2.reload.approval_status).to eq('qc_completed')
        expect(ra3.reload.approval_status).to eq('not_ready')
      end
    end

    context 'with qc2 level' do
      it 'update only this qc related records to next level' do
        results, meta = described_class.call!([ra1.id, ra2.id, ra3.id], client_admins[1])
        expect(results).to eq([ra2])
        expect(meta).to eq({ approved: 1, qc_completed: 0, ignored: 0 })
        expect(ra1.reload.approval_status).to eq('pending_qc')
        expect(ra2.reload.approval_status).to eq('approved')
        expect(ra3.reload.approval_status).to eq('not_ready')
      end
    end
  end

  describe '#call with one level QC' do
    let!(:ras1) do
      create(:report_approval_setting, qc_user_ids: [client_admins[0].id], approver_user_ids: [client_admins[1].id],
             approvers_not_required: true, allow_qc_bulk_submit: true, allow_bulk_approve: true)
    end

    let!(:ra1) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             approval_status: 'pending_qc')
    end

    let!(:ra2) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             approval_status: 'qc_completed')
    end
    let!(:ra3) do
      create(:report_approval,
             campaign_id: ras1.campaign_id,
             report_id: ras1.report_id,
             approval_status: 'not_ready')
    end

    context 'with qc1 level' do
      it 'update only this qc related records to next level' do
        results, meta = described_class.call!([ra1.id, ra2.id, ra3.id], client_admins[0])

        expect(results).to eq([ra1, ra2])
        expect(meta).to eq({ approved: 2, qc_completed: 0, ignored: 0 })
        expect(ra1.reload.approval_status).to eq('approved')
        expect(ra2.reload.approval_status).to eq('approved')
        expect(ra3.reload.approval_status).to eq('not_ready')
      end
    end
  end
end
