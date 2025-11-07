# frozen_string_literal: true

require 'rails_helper'

describe Idp::RevertSkillToPublic do
  let(:user) { create(:user) }
  let(:manager) { create(:user) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:idp_template) { create(:idp_template, project: project) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  let(:skill) { create(:skill) }
  let(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill, private: true) }
  let(:idp_setting) { project.idp_setting }

  before do
    user.update!(manager: manager)
  end

  describe '#call' do
    context 'when skill is already public' do
      before { user_idp_skill.update!(private: false) }

      it 'returns an error' do
        result = described_class.call(user_idp_skill, user)

        expect(result[:error]).to eq('Skill is already public')
      end
    end

    context 'when skill not found' do
      it 'returns an error' do
        result = described_class.call(nil, user)

        expect(result[:error]).to eq('Skill not found')
      end
    end

    context 'when user reverts their own private skill to public' do
      before { user_idp_plan.update!(approval_status: :draft) }

      context 'with manager approval disabled' do
        before { idp_setting.update!(manager_approves_idp: false) }

        it 'successfully reverts skill to public without triggering approval' do
          result = described_class.call(user_idp_skill, user)

          expect(result[:ok]).to be_present
          expect(result[:ok][:skill].private?).to be false
          expect(result[:ok][:requires_approval]).to be false
          expect(result[:ok][:message]).to eq("Skill '#{skill.name}' is now visible to your manager")
          expect(user_idp_plan.reload.approval_status).to eq('draft')
        end
      end

      context 'with manager approval enabled' do
        before { idp_setting.update!(manager_approves_idp: true) }

        context 'when plan is in draft status' do
          before { user_idp_plan.update!(approval_status: :draft) }

          it 'reverts skill without triggering approval flow' do
            result = described_class.call(user_idp_skill, user)

            expect(result[:ok]).to be_present
            expect(result[:ok][:skill].private?).to be false
            expect(result[:ok][:requires_approval]).to be false
            expect(user_idp_plan.reload.approval_status).to eq('draft')
          end
        end

        context 'when plan is approved' do
          before { user_idp_plan.update!(approval_status: :approved, completion_status: :in_progress) }

          it 'reverts skill and triggers approval flow' do
            result = described_class.call(user_idp_skill, user)

            expect(result[:ok]).to be_present
            expect(result[:ok][:skill].private?).to be false
            expect(result[:ok][:requires_approval]).to be true
            expect(user_idp_plan.reload.approval_status).to eq('pending_approval')
          end
        end

        context 'when plan is in_progress' do
          before { user_idp_plan.update!(completion_status: :in_progress, approval_status: :approved) }

          it 'reverts skill and moves plan to pending approval' do
            result = described_class.call(user_idp_skill, user)

            expect(result[:ok]).to be_present
            expect(result[:ok][:requires_approval]).to be true
            expect(user_idp_plan.reload.approval_status).to eq('pending_approval')
          end
        end

        context 'when plan is completed' do
          before { user_idp_plan.update!(completion_status: :completed, approval_status: :approved) }

          it 'reverts skill and moves plan to pending approval' do
            result = described_class.call(user_idp_skill, user)

            expect(result[:ok]).to be_present
            expect(result[:ok][:requires_approval]).to be true
            expect(user_idp_plan.reload.approval_status).to eq('pending_approval')
          end
        end

        context 'when plan is rejected' do
          before { user_idp_plan.update!(approval_status: :rejected, completion_status: :completed) }

          it 'reverts skill and submits for approval' do
            result = described_class.call(user_idp_skill, user)

            expect(result[:ok]).to be_present
            expect(result[:ok][:requires_approval]).to be true
            expect(user_idp_plan.reload.approval_status).to eq('pending_approval')
          end
        end
      end
    end

    context 'when manager reverts skill to public' do
      before do
        idp_setting.update!(manager_can_edit_idp: true, manager_approves_idp: true)
        user_idp_plan.update!(approval_status: :pending_approval)
      end

      it 'allows manager to revert skill' do
        result = described_class.call(user_idp_skill, manager)

        expect(result[:ok]).to be_present
        expect(result[:ok][:skill].private?).to be false
      end
    end
  end
end
