# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::AI::ScoreApprovalPolicy do
  subject(:policy) { described_class.new(user, score_approval) }

  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:users_result) { create(:users_result) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, users_result: users_result)
  end
  let(:score_approval) { AI::ScoreApproval.find(user_assessment.id) }
  let(:assessor) { create(:user) }
  let(:approver) { create(:user) }
  let(:other_user) { create(:user) }
  let(:superadmin) { create(:superadmin) }

  let!(:approval_setting) do
    create(:ai_scoring_approval_setting,
           campaign_id: campaign.id,
           assessment_id: assessment.id,
           assessor_ids: [assessor.id],
           approver_ids: [approver.id],
           allow_one_level_approve: false,
           allow_bulk_approve_scores: true)
  end

  describe '#show?' do
    context 'when user is superadmin' do
      let(:user) { superadmin }

      it 'allows access' do
        expect(policy.show?).to be true
      end
    end

    context 'when user is an assessor' do
      let(:user) { assessor }

      it 'allows access' do
        expect(policy.show?).to be true
      end
    end

    context 'when user is an approver' do
      let(:user) { approver }

      it 'allows access' do
        expect(policy.show?).to be true
      end
    end

    context 'when user is neither assessor nor approver' do
      let(:user) { other_user }

      it 'denies access' do
        expect(policy.show?).to be false
      end
    end
  end

  describe 'approval actions' do
    shared_examples 'approval action' do |action|
      context 'with two-level approval settings' do
        before do
          approval_setting.update!(allow_one_level_approve: false)
        end

        context 'when user is superadmin' do
          let(:user) { superadmin }

          it 'allows the action regardless of status' do
            expect(policy.public_send(action)).to be true
          end
        end

        context 'when status is pending' do
          before do
            score_approval.update!(approval_status: :pending)
          end

          context 'when user is assessor' do
            let(:user) { assessor }

            it 'allows the action' do
              expect(policy.public_send(action)).to be true
            end
          end

          context 'when user is approver' do
            let(:user) { approver }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end

          context 'when user is neither assessor nor approver' do
            let(:user) { other_user }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end
        end

        context 'when status is assessor_approved' do
          before do
            score_approval.update!(approval_status: :assessor_approved)
          end

          context 'when user is assessor' do
            let(:user) { assessor }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end

          context 'when user is approver' do
            let(:user) { approver }

            it 'allows the action' do
              expect(policy.public_send(action)).to be true
            end
          end

          context 'when user is neither assessor nor approver' do
            let(:user) { other_user }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end
        end

        context 'when status is approver_approved' do
          before do
            score_approval.update!(approval_status: :approver_approved)
          end

          context 'when user is assessor' do
            let(:user) { assessor }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end

          context 'when user is approver' do
            let(:user) { approver }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end
        end
      end

      context 'with one-level approval settings' do
        before do
          approval_setting.update!(allow_one_level_approve: true)
        end

        context 'when status is pending' do
          before do
            score_approval.update!(approval_status: :pending)
          end

          context 'when user is approver' do
            let(:user) { approver }

            it 'allows the action' do
              expect(policy.public_send(action)).to be true
            end
          end

          context 'when user is assessor' do
            let(:user) { assessor }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end

          context 'when user is neither assessor nor approver' do
            let(:user) { other_user }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end
        end

        context 'when status is assessor_approved' do
          before do
            score_approval.update!(approval_status: :assessor_approved)
          end

          context 'when user is approver' do
            let(:user) { approver }

            it 'allows the action' do
              expect(policy.public_send(action)).to be true
            end
          end

          context 'when user is assessor' do
            let(:user) { assessor }

            it 'denies the action' do
              expect(policy.public_send(action)).to be false
            end
          end
        end
      end
    end

    describe '#approve_question?' do
      it_behaves_like 'approval action', :approve_question?
    end

    describe '#discard_question?' do
      it_behaves_like 'approval action', :discard_question?
    end

    describe '#approve_all_questions?' do
      it_behaves_like 'approval action', :approve_all_questions?

      context 'when allow_bulk_approve_scores is false' do
        before { approval_setting.update!(allow_bulk_approve_scores: false) }
        let(:user) { superadmin }

        it 'denies the action even for superadmin' do
          expect(policy.approve_all_questions?).to be false
        end
      end
    end

    describe '#discard_all_questions?' do
      it_behaves_like 'approval action', :discard_all_questions?

      context 'when allow_bulk_approve_scores is false' do
        before { approval_setting.update!(allow_bulk_approve_scores: false) }
        let(:user) { superadmin }

        it 'denies the action even for superadmin' do
          expect(policy.discard_all_questions?).to be false
        end
      end
    end

    describe '#override_score?' do
      it_behaves_like 'approval action', :override_score?
    end

    describe '#discard_score?' do
      it_behaves_like 'approval action', :discard_score?
    end
  end

  describe '#reset_approval?' do
    context 'when user is superadmin' do
      let(:user) { superadmin }

      it 'allows the action' do
        expect(policy.reset_approval?).to be true
      end
    end

    context 'when user is an approver' do
      let(:user) { approver }

      it 'denies the action' do
        expect(policy.reset_approval?).to be false
      end
    end

    context 'when user is an assessor' do
      let(:user) { assessor }

      it 'denies the action' do
        expect(policy.reset_approval?).to be false
      end
    end

    context 'when user is neither assessor nor approver' do
      let(:user) { other_user }

      it 'denies the action' do
        expect(policy.reset_approval?).to be false
      end
    end
  end
end
