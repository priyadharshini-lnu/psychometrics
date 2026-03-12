# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::ApproveQuestion do
  subject(:service) { described_class.call(score_approval, question_id, current_user) }

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
    context 'not allow to approve for users out of settings list' do
      let(:unauthorized_user) { create(:user) }
      let(:current_user) { unauthorized_user }

      it 'returns error when user is not in assessor or approver list' do
        result = service

        expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
        expect(result[:ok]).to be_nil
      end

      it 'does not update any question scores' do
        service

        indicators.each do |score|
          expect(score.reload.status).to eq('pending')
        end
      end
    end

    context 'when current user is an assessor' do
      let(:current_user) { assessor }

      context 'with two-level approval settings' do
        it 'updates question scores to assessor_approved status' do
          result = service

          expect(result[:ok]).to eq(indicators)
          indicators.each do |score|
            expect(score.reload.status).to eq('assessor_approved')
          end
        end

        it 'does not change other question scores status' do
          service

          expect(competency.reload.status).to eq('pending')
        end

        context 'when all questions are approved by assessor' do
          before do
            other_question_scores.each { |score| score.update!(status: 'assessor_approved') }
          end
          it 'approves the score approval and updates assessor details' do
            service

            score_approval.reload
            expect(score_approval.approval_status).to eq('assessor_approved')
            expect(score_approval.score_assessed_by_id).to eq(current_user.id)
            expect(score_approval.score_assessed_at).to eq(Time.current)
          end
        end

        context 'when not all questions are approved by assessor' do
          it 'does not approve the score approval' do
            service

            expect(score_approval.reload.approval_status).to eq('pending')
            expect(score_approval.score_assessed_by_id).to be_nil
          end
        end
      end
    end

    context 'when current user is an approver' do
      let(:current_user) { approver }
      before do
        score_approval.update!(approval_status: :assessor_approved)
      end

      context 'with two-level approval settings' do
        it 'updates question scores to approver_approved status' do
          result = service

          expect(result[:ok]).to eq(indicators)
          indicators.each do |score|
            expect(score.reload.status).to eq('approver_approved')
          end
        end

        context 'when all questions are approved by approver' do
          before do
            other_question_scores.each { |score| score.update!(status: :approver_approved) }
          end

          it 'final approves the score approval and updates approver details' do
            service

            score_approval.reload
            expect(score_approval.approval_status).to eq('approver_approved')
            expect(score_approval.score_approved_by_id).to eq(current_user.id)
            expect(score_approval.score_approved_at).to eq(Time.current)
          end
        end
      end

      context 'with one-level approval settings' do
        before do
          approval_settings.update!(allow_one_level_approve: true)
        end

        it 'updates question scores to approver_approved status' do
          service

          indicators.each do |score|
            expect(score.reload.status).to eq('approver_approved')
          end
        end

        context 'when all questions are approved' do
          before do
            other_question_scores.each { |score| score.update!(status: :approver_approved) }
          end

          it 'final approves the score approval and updates approver details' do
            service

            score_approval.reload
            expect(score_approval.approval_status).to eq('approver_approved')
            expect(score_approval.score_approved_by_id).to eq(current_user.id)
            expect(score_approval.score_approved_at).to eq(Time.current)
          end
        end
      end
    end

    context 'when user is neither assessor nor approver' do
      it 'does not update question scores status' do
        service

        indicators.each do |score|
          expect(score.reload.status).to eq('pending')
        end
      end
    end

    context 'with aggregated scores' do
      let!(:aggregated_scores) do
        create_list(:ai_factor_score, 2,
                    users_result: users_result,
                    status: :pending,
                    scoring_type: :aggregated)
      end

      let(:current_user) { approver }

      before do
        approval_settings.update!(allow_one_level_approve: true)
      end

      it 'does not consider aggregated scores when checking if all questions are approved' do
        # Only approve the non-aggregated question scores
        other_question_scores.each { |score| score.update!(status: :approver_approved) }

        service

        score_approval.reload
        expect(score_approval.approval_status).to eq('approver_approved')
      end
    end

    context 'when user is superadmin' do
      let(:current_user) { create(:superadmin) }

      context 'with two-level approval settings' do
        before do
          approval_settings.update!(allow_one_level_approve: false)
        end

        context 'when status is pending' do
          before do
            score_approval.update!(approval_status: :pending)
          end

          it 'approves question with assessor_approved status' do
            service

            indicators.each do |score|
              expect(score.reload.status).to eq('assessor_approved')
            end
          end

          it 'moves to assessor_approved when all questions are approved' do
            other_question_scores.each { |score| score.update!(status: :assessor_approved) }

            service

            score_approval.reload
            expect(score_approval.approval_status).to eq('assessor_approved')
          end
        end

        context 'when status is assessor_approved' do
          before do
            score_approval.update!(approval_status: :assessor_approved)
            indicators.each { |score| score.update!(status: :assessor_approved) }
          end

          it 'approves question with approver_approved status' do
            service

            indicators.each do |score|
              expect(score.reload.status).to eq('approver_approved')
            end
          end

          it 'moves to approver_approved when all questions are approved' do
            other_question_scores.each { |score| score.update!(status: :approver_approved) }

            service

            score_approval.reload
            expect(score_approval.approval_status).to eq('approver_approved')
          end
        end
      end

      context 'with one-level approval settings' do
        before do
          approval_settings.update!(allow_one_level_approve: true)
          score_approval.update!(approval_status: :pending)
        end

        it 'approves question with approver_approved status' do
          service

          indicators.each do |score|
            expect(score.reload.status).to eq('approver_approved')
          end
        end

        it 'moves to approver_approved when all questions are approved' do
          other_question_scores.each { |score| score.update!(status: :approver_approved) }

          service

          score_approval.reload
          expect(score_approval.approval_status).to eq('approver_approved')
        end
      end

      context 'when status is already approver_approved' do
        before do
          score_approval.update!(approval_status: :approver_approved)
        end

        it 'returns error and does not update scores' do
          result = service

          expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
          indicators.each do |score|
            expect(score.reload.status).to eq('pending')
          end
        end
      end
    end

    context 'when policy denies approval' do
      let(:current_user) { approver }

      before do
        score_approval.update!(approval_status: :approver_approved)
      end

      it 'returns error message' do
        result = service

        expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
        expect(result[:ok]).to be_nil
      end

      it 'does not update question scores' do
        service

        indicators.each do |score|
          expect(score.reload.status).to eq('pending')
        end
      end
    end

    context 'when trying to approve with wrong role for current status' do
      context 'approver trying to approve pending status in two-level approval' do
        let(:current_user) { approver }

        before do
          approval_settings.update!(allow_one_level_approve: false)
          score_approval.update!(approval_status: :pending)
        end

        it 'returns error' do
          result = service

          expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
        end
      end

      context 'assessor trying to approve assessor_approved status' do
        let(:current_user) { assessor }

        before do
          score_approval.update!(approval_status: :assessor_approved)
        end

        it 'returns error' do
          result = service

          expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_approve'))
        end
      end
    end
  end
end
