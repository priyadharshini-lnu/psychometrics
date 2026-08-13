# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::ResetApproval do
  subject(:service) { described_class.call(score_approval, current_user) }

  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:users_result) { create(:users_result) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, users_result: users_result)
  end
  let(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }
  let(:current_user) { create(:superadmin) }
  let!(:question) { create(:question, assessment: assessment) }
  let(:competency_factor) { create(:factor) }

  let!(:approval_setting) do
    create(:ai_scoring_approval_setting,
           campaign_id: campaign.id,
           assessment_id: assessment.id,
           assessor_ids: [create(:user).id],
           approver_ids: [create(:user).id],
           allow_one_level_approve: false)
  end

  let!(:competency) do
    create(:ai_factor_score,
           users_result: users_result,
           factor: competency_factor,
           question_id: nil,
           status: :approver_approved,
           scoring_type: :aggregated,
           parent_factor_id: nil)
  end

  let!(:indicators) do
    create_list(:ai_factor_score, 3,
                users_result: users_result,
                question_id: question.id,
                status: :approver_approved,
                parent_factor_id: competency_factor.id,
                scoring_type: :ai)
  end

  before do
    allow(UsersResults::CalculateScoring).to receive(:call!).and_return({ 'recomputed' => true })
    allow(ScoreApprovals::NotifyApprovers).to receive(:call!)
    allow(ScoreApprovals::NotifyAssessors).to receive(:call!)
    allow(ScoreApprovals::NotifyApprovalNotifications).to receive(:call!)
  end

  describe '#call' do
    context 'when status is approver_approved with two-level approval' do
      before { user_assessment.update_column(:approval_status, 'approver_approved') }

      it 'moves the approval back to assessor_approved' do
        service

        expect(score_approval.reload.approval_status).to eq('assessor_approved')
      end

      it 'downgrades non-aggregated factor scores to assessor_approved' do
        service

        indicators.each { |score| expect(score.reload.status).to eq('assessor_approved') }
      end

      it 'leaves aggregated factor scores untouched' do
        service

        expect(competency.reload.status).to eq('approver_approved')
      end

      it 'recomputes the scoring to remove approved AI results' do
        service

        expect(UsersResults::CalculateScoring).to have_received(:call!).with(users_result)
        expect(users_result.reload.scoring).to eq({ 'recomputed' => true })
      end

      it 'clears the approver details' do
        user_assessment.update_columns(score_approved_by_id: current_user.id, score_approved_at: Time.current)

        service

        expect(score_approval.reload.score_approved_by_id).to be_nil
        expect(score_approval.score_approved_at).to be_nil
      end

      it 'notifies the approvers that the item is back in their queue' do
        service

        expect(ScoreApprovals::NotifyApprovers).to have_received(:call!).with(score_approval)
      end

      it 'returns ok' do
        expect(service[:ok]).not_to be_nil
      end
    end

    context 'when status is approver_approved with one-level approval' do
      before do
        approval_setting.update!(allow_one_level_approve: true)
        user_assessment.update_column(:approval_status, 'approver_approved')
      end

      it 'moves the approval back to pending' do
        service

        expect(score_approval.reload.approval_status).to eq('pending')
      end

      it 'downgrades non-aggregated factor scores to pending' do
        service

        indicators.each { |score| expect(score.reload.status).to eq('pending') }
      end

      it 'recomputes the scoring' do
        service

        expect(UsersResults::CalculateScoring).to have_received(:call!).with(users_result)
      end

      it 'notifies the assessors' do
        service

        expect(ScoreApprovals::NotifyAssessors).to have_received(:call!).with(score_approval)
      end
    end

    context 'when status is assessor_approved' do
      before do
        users_result.update!(scoring: { 'original' => true })
        users_result.ai_factor_scores.where.not(scoring_type: :aggregated).update_all(status: 'assessor_approved')
        user_assessment.update_column(:approval_status, 'assessor_approved')
      end

      it 'moves the approval back to pending' do
        service

        expect(score_approval.reload.approval_status).to eq('pending')
      end

      it 'downgrades non-aggregated factor scores to pending' do
        service

        indicators.each { |score| expect(score.reload.status).to eq('pending') }
      end

      it 'does not recompute the scoring' do
        service

        expect(UsersResults::CalculateScoring).not_to have_received(:call!)
        expect(users_result.reload.scoring).to eq({ 'original' => true })
      end

      it 'notifies the assessors' do
        service

        expect(ScoreApprovals::NotifyAssessors).to have_received(:call!).with(score_approval)
      end
    end

    context 'when status is auto_approved' do
      before do
        users_result.ai_factor_scores.where.not(scoring_type: :aggregated).update_all(status: 'auto_approved')
        user_assessment.update_column(:approval_status, 'auto_approved')
      end

      it 'moves the approval back to pending' do
        service

        expect(score_approval.reload.approval_status).to eq('pending')
      end

      it 'recomputes the scoring' do
        service

        expect(UsersResults::CalculateScoring).to have_received(:call!).with(users_result)
      end
    end

    context 'when status is pending' do
      before { user_assessment.update_column(:approval_status, 'pending') }

      it 'returns an error' do
        expect(service[:error]).to eq(I18n.t('admin.score_approval_reset_not_allowed'))
      end

      it 'does not change the approval status' do
        service

        expect(score_approval.reload.approval_status).to eq('pending')
      end

      it 'does not recompute the scoring' do
        service

        expect(UsersResults::CalculateScoring).not_to have_received(:call!)
      end
    end

    context 'with a dependent report' do
      let(:report) { create(:report) }
      let(:user_report) do
        create(:user_report, report: report, campaign: campaign, user: user_assessment.subject, status: :prepared)
      end

      before do
        create(:assessments_report, assessment: assessment, report: report)
        create(:report_approval_setting, campaign: campaign, report: report)
        user_report.update_column(:approval_status, 'approved')
        user_assessment.update_column(:approval_status, 'approver_approved')
      end

      it 'resets the report status and approval status' do
        service

        expect(user_report.reload.status).to eq('not_prepared')
        expect(user_report.approval_status).to eq('not_ready')
      end
    end
  end
end
