# frozen_string_literal: true

require 'rails_helper'

describe Idp::UpdateStatusForm do
  let(:manager) { create(:user) }
  let(:idp_user) { create(:user, manager: manager) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: idp_user, idp_template: idp_template, approval_status: 'draft') }
  let(:project) { user_idp_plan.campaign.project }
  let(:idp_setting) { create(:idp_setting, project_id: project.id, manager_approves_idp: manager_approves_idp) }
  let(:reflection_question) { create(:reflection_question, project_id: project.id) }
  let(:new_status) { nil }

  before { allow(user_idp_plan.project).to receive(:idp_setting).and_return(idp_setting) }

  subject(:form) do
    described_class.from_params(
      { status: new_status }
    ).with_context(
      user_idp_plan: user_idp_plan,
      current_user: current_user
    )
  end

  shared_examples 'does not permit status' do
    it 'adds error on status' do
      form.validate
      expect(form.errors[:status]).to include(/not permitted/)
      expect(form.save!).to eq false
      expect(user_idp_plan.reload.approval_status).not_to eq(new_status)
    end
  end

  context 'when manager approval is required' do
    let(:manager_approves_idp) { true }

    context 'when current_user is manager' do
      let(:current_user) { manager }

      context 'with valid status' do
        context 'when manager starts review' do
          let(:new_status) { 'in_review' }
          before { user_idp_plan.update!(approval_status: 'pending_approval') }

          it 'updates the status to in_review' do
            expect(form.validate).to eq true
            expect(form.save!).to eq true
            expect(user_idp_plan.reload.approval_status).to eq('in_review')
          end
        end

        context 'when manager rejects' do
          let(:new_status) { 'rejected' }
          before { user_idp_plan.update!(approval_status: 'in_review') }

          it 'updates the status to rejected' do
            expect(form.validate).to eq true
            expect(form.save!).to eq true
            expect(user_idp_plan.reload.approval_status).to eq('rejected')
          end
        end

        context 'when manager approves' do
          let(:new_status) { 'approved' }
          before { user_idp_plan.update!(approval_status: 'in_review') }

          it 'updates the status to approved' do
            expect(form.validate).to eq true
            expect(form.save!).to eq true
            expect(user_idp_plan.reload.approval_status).to eq('approved')
          end
        end
      end

      context 'with invalid status' do
        let(:new_status) { 'completed' }
        include_examples 'does not permit status'
      end

      context 'when status is forbidden for manager' do
        let(:new_status) { 'approved' }
        %w[completed in_progress not_started].each do |forbidden_state|
          context "when user_idp_plan status is '#{forbidden_state}'" do
            before { user_idp_plan.update!(completion_status: forbidden_state) }

            it 'adds error and does not update' do
              form.validate
              expect(form.errors[:base]).
                to include("Manager cannot update status when plan is in '#{forbidden_state}' state.")
              expect(form.save!).to eq false
              expect(user_idp_plan.reload.completion_status).to eq(forbidden_state)
            end
          end
        end
      end
    end

    context 'when current_user is idp_user' do
      let(:current_user) { idp_user }

      context 'with valid status' do
        let(:new_status) { 'completed' }
        before { user_idp_plan.update!(completion_status: 'in_progress', approval_status: 'approved') }

        it 'updates the status' do
          expect(form.validate).to eq true
          expect(form.save!).to eq true
          expect(user_idp_plan.reload.completion_status).to eq('completed')
        end
      end

      context 'with invalid status' do
        let(:new_status) { 'approved' }
        include_examples 'does not permit status'
      end
    end

    context 'when current_user is neither manager nor idp_user' do
      let(:current_user) { create(:user) }
      let(:new_status) { 'approved' }
      include_examples 'does not permit status'
    end
  end

  context 'when manager approval is NOT required' do
    let(:manager_approves_idp) { false }

    context 'when current_user is idp_user' do
      let(:current_user) { idp_user }

      context 'with valid status' do
        let(:new_status) { 'approved' }

        it 'updates the status' do
          expect(form.validate).to eq true
          expect(form.save!).to eq true
          expect(user_idp_plan.reload.approval_status).to eq('approved')
        end
      end

      context 'with invalid status' do
        let(:new_status) { 'pending_approval' }
        include_examples 'does not permit status'
      end
    end

    context 'when current_user is manager' do
      let(:current_user) { manager }
      let(:new_status) { 'approved' }
      include_examples 'does not permit status'
    end
  end

  context 'when update raises workflow error' do
    let(:manager_approves_idp) { true }
    let(:current_user) { idp_user }
    let(:new_status) { 'pending_approval' }

    before do
      user_idp_plan.update!(approval_status: 'not_started')
    end

    it 'adds base error with validation message' do
      expect(form.validate).to eq true
      expect(form.save!).to eq false
      expect(form.errors[:base].first).to match(
        /There is no event submit_for_approval defined for the not_started state/
      )
    end
  end

  context 'mandatory reflective questions should be answered' do
    let(:manager_approves_idp) { true }
    let(:current_user) { idp_user }
    let(:new_status) { 'completed' }

    before do
      user_idp_plan.update!(completion_status: 'in_progress')
      user_idp_plan.update!(approval_status: 'approved')
      user_idp_plan.idp_template.idp_template_reflection_questions.create!(
        reflection_question: reflection_question,
        mandatory: true
      )
    end

    it 'validates that all mandatory reflective questions are answered' do
      expect(form.validate).to eq false
      expect(form.errors[:base]).to include(I18n.t('validations.idp.reflective_questions_required'))
      expect(form.save!).to eq false
    end

    context 'when all mandatory reflective questions are answered' do
      before do
        user_idp_plan.user_reflection_question_answers.create!(
          reflection_question: reflection_question,
          answer: 'Some answer'
        )
      end

      it 'allows the status to be updated' do
        expect(form.validate).to eq true
        expect(form.save!).to eq true
        expect(user_idp_plan.reload.completion_status).to eq('completed')
      end
    end
  end

  context 'when starting a plan that is not approved' do
    let(:manager_approves_idp) { true }
    let(:current_user) { idp_user }
    let(:new_status) { 'in_progress' }

    before { user_idp_plan.update!(approval_status: 'pending_approval') }

    it 'does not permit starting the plan' do
      form.validate
      expect(form.errors[:base]).to include(I18n.t('validations.idp.can_not_start_without_approval'))
      expect(user_idp_plan.reload.completion_status).not_to eq('in_progress')
    end
  end

  context 'when completing a plan that is not approved' do
    let(:manager_approves_idp) { true }
    let(:current_user) { idp_user }
    let(:new_status) { 'completed' }

    before { user_idp_plan.update!(approval_status: 'draft', completion_status: 'in_progress') }

    it 'does not permit completing the plan' do
      form.validate
      expect(form.errors[:base]).to include(
        I18n.t('validations.idp.can_not_complete_without_approval_and_in_progress')
      )
      expect(user_idp_plan.reload.completion_status).not_to eq('completed')
    end
  end

  context 'when completing a plan that is not in progress' do
    let(:manager_approves_idp) { true }
    let(:current_user) { idp_user }
    let(:new_status) { 'completed' }

    before { user_idp_plan.update!(approval_status: 'approved', completion_status: 'not_started') }

    it 'does not permit completing the plan' do
      form.validate
      expect(form.errors[:base]).to include(
        I18n.t('validations.idp.can_not_complete_without_approval_and_in_progress')
      )
      expect(user_idp_plan.reload.completion_status).not_to eq('completed')
    end
  end
end
