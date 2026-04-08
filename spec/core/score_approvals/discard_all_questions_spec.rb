# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::DiscardAllQuestions do
  subject(:service) { described_class.call(score_approval, current_user) }

  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:users_result) { create(:users_result) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, users_result: users_result)
  end
  let!(:question) { create(:question, assessment: assessment) }
  let!(:question2) { create(:question, assessment: assessment) }
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
           approver_ids: [approver.id],
           allow_bulk_approve_scores: true)
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

  let!(:question1_scores) do
    create_list(:ai_factor_score, 3,
                users_result: users_result,
                question_id: question.id,
                status: :assessor_approved,
                parent_factor_id: competency_factor.id,
                scoring_type: :ai,
                override_score: 3)
  end

  let!(:question2_scores) do
    create_list(:ai_factor_score, 2,
                users_result: users_result,
                question_id: question2.id,
                status: :assessor_approved,
                parent_factor_id: competency_factor.id,
                scoring_type: :ai,
                override_score: 4)
  end

  describe '#call' do
    context 'when user is not allowed to discard' do
      let(:unauthorized_user) { create(:user) }
      let(:current_user) { unauthorized_user }

      it 'returns error when user is not in assessor or approver list' do
        result = service

        expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_discard'))
        expect(result[:ok]).to be_nil
      end

      it 'does not update any question scores' do
        service

        (question1_scores + question2_scores).each do |score|
          expect(score.reload.status).to eq('assessor_approved')
          expect(score.reload.override_score).to be_present
        end
      end
    end

    context 'when current user is an assessor' do
      let(:current_user) { assessor }

      context 'with two-level approval settings' do
        it 'discards all question scores and resets override values' do
          result = service

          # Expect the result to include the question scores (may include dependent aggregated scores too)
          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present

          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
            expect(score.not_applicable).to be false
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
        it 'discards all question scores and resets override values' do
          result = service

          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present
          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
          end
        end
      end

      context 'with one-level approval settings' do
        before do
          approval_settings.update!(allow_one_level_approve: true)
          score_approval.update!(approval_status: :pending)
        end

        it 'allows approver to discard all question scores' do
          result = service

          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present
          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
          end
        end
      end
    end

    context 'when user is superadmin' do
      let(:current_user) { create(:superadmin) }

      before do
        (question1_scores + question2_scores).each do |score|
          score.update!(status: :approver_approved, override_score: 5)
        end
      end

      context 'with pending status' do
        before do
          score_approval.update!(approval_status: :pending)
        end

        it 'allows discard operation' do
          result = service

          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present
          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
          end
        end
      end

      context 'with assessor_approved status' do
        before do
          score_approval.update!(approval_status: :assessor_approved)
        end

        it 'allows discard operation' do
          result = service

          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present
          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
          end
        end
      end

      context 'with approver_approved status' do
        before do
          score_approval.update!(approval_status: :approver_approved)
        end

        it 'allows discard operation (superadmin override)' do
          result = service

          # Result should include updated scores (aggregated and question scores)
          expect(result[:ok]).to be_present
          (question1_scores + question2_scores).each do |score|
            score.reload
            expect(score.override_score).to be_nil
          end
        end
      end
    end

    context 'with aggregated scores' do
      let!(:aggregated_scores) do
        create_list(:ai_factor_score, 2,
                    users_result: users_result,
                    status: :assessor_approved,
                    scoring_type: :aggregated)
      end

      let(:current_user) { assessor }

      it 'does not include aggregated scores in the discard operation' do
        result = service

        expect(result[:ok]).to be_present
        expect(result[:ok]).not_to include(*aggregated_scores)
      end
    end

    context 'when bulk approve scores setting is false' do
      let(:current_user) { assessor }

      before do
        approval_settings.update!(allow_bulk_approve_scores: false)
      end

      it 'returns error message' do
        result = service

        expect(result[:error]).to eq(I18n.t('admin.score_approval_not_allowed_to_discard'))
        expect(result[:ok]).to be_nil
      end
    end
  end
end
