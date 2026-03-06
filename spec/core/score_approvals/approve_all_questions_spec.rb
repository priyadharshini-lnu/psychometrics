# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::ApproveAllQuestions do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:users_result) { create(:users_result) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, users_result: users_result)
  end
  let!(:question) { create(:question, assessment: assessment) }
  let!(:question2) { create(:question, assessment: assessment) }
  let(:question_id) { question.id }
  let(:question2_id) { question2.id }
  let(:current_user) { create(:user) }
  let(:competency_factor) { create(:factor) }
  let(:assessor) { create(:user) }
  let(:approver) { create(:user) }
  let!(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }

  let!(:approval_settings) do
    create(:ai_scoring_approval_setting,
           campaign_id: campaign.id,
           assessment_id: assessment.id,
           assessor_ids: [assessor.id],
           approver_ids: [approver.id])
  end

  let!(:competency) do
    create(:ai_factor_score,
           users_result: users_result,
           factor: competency_factor,
           question_id: nil,
           status: :pending,
           scoring_type: :aggregated,
           parent_factor_id: nil)
  end
  let!(:indicators) do
    create_list(:ai_factor_score, 3,
                users_result: users_result,
                question_id: question_id,
                status: :pending,
                parent_factor_id: competency_factor.id,
                scoring_type: :ai)
  end

  let!(:other_question_scores) do
    create_list(:ai_factor_score, 2,
                users_result: users_result,
                question_id: question2_id,
                status: :pending,
                parent_factor_id: competency_factor.id,
                scoring_type: :ai)
  end

  describe '#call' do
    subject { described_class.call(score_approval, current_user) }

    context 'approve as assessor' do
      let(:current_user) { assessor }

      it 'approves all non-aggregated question scores' do
        subject

        expect(score_approval.users_result.ai_factor_scores.where.not(scoring_type: :aggregated).all? do |score|
          score.status == 'assessor_approved'
        end).to be true
        expect(score_approval.reload.approval_status).to eq('assessor_approved')
      end
    end

    context 'approve all as approver' do
      let(:current_user) { approver }

      before do
        score_approval.update(approval_status: :assessor_approved)
      end

      it 'approves all non-aggregated question scores' do
        subject

        expect(score_approval.users_result.ai_factor_scores.where.not(scoring_type: :aggregated).all? do |score|
          score.status == 'approver_approved'
        end).to be true
        expect(score_approval.reload.approval_status).to eq('approver_approved')
      end
    end

    context 'with one level approval allows approver approve all' do
      let(:current_user) { approver }

      before do
        approval_settings.update!(allow_one_level_approve: true)
      end

      it 'approves all non-aggregated question scores' do
        subject

        expect(score_approval.users_result.ai_factor_scores.where.not(scoring_type: :aggregated).all? do |score|
          score.status == 'approver_approved'
        end).to be true
        expect(score_approval.reload.approval_status).to eq('approver_approved')
      end
    end

    context 'two level approval not allowed to approve on first level' do
      let(:current_user) { approver }

      it 'returns an error' do
        result = subject
        expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
        expect(result[:ok]).to be_nil
      end
    end
  end
end
