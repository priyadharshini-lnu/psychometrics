# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpSkillsPolicy do
  let(:manager) { create(:user) }
  let(:user) { create(:user, manager: manager) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, status: 'draft', active: true) }
  let(:project) { user_idp_plan.campaign.project }
  let!(:another_user) { create(:user, project: manager.project) }

  let!(:extra_params) { { user_idp_plan: user_idp_plan } }

  def policy_context(current_user)
    {
      current_user: current_user,
      current_client: project.client,
      current_project: project
    }
  end

  before do
    project.idp_setting.update!(manager_can_edit_idp: true)
  end

  describe '#index?' do
    context 'when record is the user themselves' do
      subject { described_class.new(policy_context(user), user, extra_params) }

      it 'allows access' do
        expect(subject.index?).to be_truthy
      end
    end

    context 'when record is another user' do
      subject { described_class.new(policy_context(another_user), user, extra_params) }

      it 'denies access' do
        expect(subject.index?).to be_falsey
      end
    end
  end

  describe '#update?' do
    context 'when user can edit their own plan' do
      subject { described_class.new(policy_context(user), user, extra_params) }

      context 'with editable status' do
        before { user_idp_plan.update(status: :draft) }

        it 'allows access' do
          expect(subject.update?).to be_truthy
        end
      end

      context 'with non-editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.update?).to be_falsey
        end
      end
    end

    context 'when manager can edit plan' do
      subject { described_class.new(policy_context(manager), user, extra_params) }

      context 'with manager editable status' do
        before { user_idp_plan.update!(status: :pending_approval) }

        it 'allows access' do
          expect(subject.update?).to be_truthy
        end
      end

      context 'with non-manager editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.update?).to be_falsey
        end
      end

      context 'when manager_can_edit_idp is false' do
        before do
          project.idp_setting.update(manager_can_edit_idp: false)
          user_idp_plan.update(status: :pending_approval)
        end

        it 'denies access' do
          expect(subject.update?).to be_falsey
        end
      end
    end

    context 'when current user is not manager or owner' do
      subject { described_class.new(policy_context(another_user), user, extra_params) }

      it 'denies access' do
        expect(subject.update?).to be_falsey
      end
    end
  end

  describe '#save_skills?' do
    context 'when current_user_idp is blank' do
      subject { described_class.new(policy_context(another_user), user, extra_params) }

      it 'denies access' do
        expect(subject.save_skills?).to be_falsey
      end
    end

    context 'when user can edit their own plan' do
      subject { described_class.new(policy_context(user), user, extra_params) }

      context 'with editable status' do
        before { user_idp_plan.update(status: :draft) }

        it 'allows access' do
          expect(subject.save_skills?).to be_truthy
        end
      end

      context 'with non-editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.save_skills?).to be_falsey
        end
      end
    end

    context 'when manager can edit plan' do
      subject { described_class.new(policy_context(manager), user, extra_params) }

      context 'with manager editable status' do
        before { user_idp_plan.update(status: :pending_approval) }

        it 'allows access' do
          expect(subject.save_skills?).to be_truthy
        end
      end

      context 'with non-manager editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.save_skills?).to be_falsey
        end
      end
    end
  end

  describe '#revert_to_public?' do
    context 'when current_user_idp is blank' do
      subject { described_class.new(policy_context(another_user), user, extra_params) }

      it 'denies access' do
        expect(subject.revert_to_public?).to be_falsey
      end
    end

    context 'when user can edit their own plan' do
      subject { described_class.new(policy_context(user), user, extra_params) }

      context 'with editable status' do
        before { user_idp_plan.update(status: :draft) }

        it 'allows access' do
          expect(subject.revert_to_public?).to be_truthy
        end
      end

      context 'with non-editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.revert_to_public?).to be_falsey
        end
      end
    end

    context 'when manager can edit plan' do
      subject { described_class.new(policy_context(manager), user, extra_params) }

      context 'with manager editable status' do
        before { user_idp_plan.update(status: :pending_approval) }

        it 'allows access' do
          expect(subject.revert_to_public?).to be_truthy
        end
      end

      context 'with non-manager editable status' do
        before { user_idp_plan.update(status: :approved) }

        it 'denies access' do
          expect(subject.revert_to_public?).to be_falsey
        end
      end
    end
  end
end
