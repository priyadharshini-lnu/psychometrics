# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::BulkApprove, type: :command do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:assessor_user) { create(:user, :assessor, with_campaign: campaign) }
  let(:approver_user) { create(:client_admin, client: campaign.project.client) }

  describe '#call' do
    context 'when settings are OFF' do
      let!(:setting) do
        create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               assessor_ids: [assessor_user.id],
               allow_bulk_approve: false,
               allow_bulk_approve_scores: true)
      end

      let!(:sa1) do
        ua = create(:user_assessment, campaign: campaign, assessment: assessment)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :pending, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      it 'returns ignored counts and does not update status' do
        expect(ScoreApprovals::ApproveAllQuestions).not_to receive(:call)

        results, meta = described_class.call!([sa1.id], assessor_user)

        expect(results).to be_empty
        expect(meta[:approved]).to eq(0)
        expect(meta[:ignored]).to eq(1)
        expect(sa1.reload.approval_status).to eq('pending')
      end
    end

    context 'when assessor bulk approves' do
      let!(:setting) do
        create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               assessor_ids: [assessor_user.id],
               allow_bulk_approve: true,
               allow_bulk_approve_scores: true)
      end

      let!(:sa1) do
        ua = create(:user_assessment, campaign: campaign, assessment: assessment)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :pending, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      it 'updates status to assessor_approved' do
        results, meta = described_class.call!([sa1.id], assessor_user)

        expect(results.size).to eq(1)
        expect(meta[:approved]).to eq(1)
        expect(sa1.reload.approval_status).to eq('assessor_approved')
      end
    end

    context 'when approver bulk approves' do
      let!(:setting) do
        create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               approver_ids: [approver_user.id],
               allow_bulk_approve: true,
               allow_bulk_approve_scores: true)
      end

      let!(:sa1) do
        ua = create(:user_assessment, campaign: campaign, assessment: assessment, approval_status: :assessor_approved)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :assessor_approved, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      it 'updates status to approver_approved' do
        results, meta = described_class.call!([sa1.id], approver_user)

        expect(results.size).to eq(1)
        expect(meta[:approved]).to eq(1)
        expect(sa1.reload.approval_status).to eq('approver_approved')
      end
    end

    context 'with mixed settings and campaigns' do
      let(:campaign2) { create(:campaign) }
      let!(:setting1) do
        create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               assessor_ids: [assessor_user.id],
               allow_bulk_approve: true,
               allow_bulk_approve_scores: true)
      end

      let!(:setting2) do
        create(:ai_scoring_approval_setting,
               campaign: campaign2,
               assessment: assessment,
               assessor_ids: [assessor_user.id],
               allow_bulk_approve: false,
               allow_bulk_approve_scores: true)
      end

      let!(:sa1) do
        ua = create(:user_assessment, campaign: campaign, assessment: assessment)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :pending, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      let!(:sa2) do
        ua = create(:user_assessment, campaign: campaign2, assessment: assessment)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :pending, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      it 'approves only the eligible assessment and ignores the rest' do
        results, meta = described_class.call!([sa1.id, sa2.id], assessor_user)

        expect(results.size).to eq(1)
        expect(meta[:approved]).to eq(1)
        expect(meta[:ignored]).to eq(1)
        expect(sa1.reload.approval_status).to eq('assessor_approved')
        expect(sa2.reload.approval_status).to eq('pending')
      end
    end

    context 'user_tasks scope verification' do
      let(:other_user) { create(:user) }
      let!(:setting) do
        create(:ai_scoring_approval_setting,
               campaign: campaign,
               assessment: assessment,
               assessor_ids: [assessor_user.id],
               allow_bulk_approve: true,
               allow_bulk_approve_scores: true)
      end

      let!(:sa1) do
        ua = create(:user_assessment, campaign: campaign, assessment: assessment)
        ua.users_result.update!(ai_scoring_status: :completed)
        create(:ai_factor_score, users_result: ua.users_result, status: :pending, scoring_type: :ai)
        AI::ScoreApproval.find(ua.id)
      end

      it 'does not return any results for users not assigned to tasks' do
        results, meta = described_class.call!([sa1.id], other_user)

        expect(results).to be_empty
        expect(meta[:approved]).to eq(0)
        expect(meta[:ignored]).to eq(0)
      end
    end
  end
end
