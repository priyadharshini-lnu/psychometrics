# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::UserIdpDevelopmentActions::BulkUpdate do
  let(:user) { create(:user, :with_project_membership) }
  let(:project) { Project.find(user.project.id) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skill) { create(:skill, project: project) }
  let(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  let(:development_action) { create(:development_action) }

  describe '#call' do
    context 'when no development actions are provided' do
      subject do
        described_class.call(
          user_idp_development_actions: [],
          user_idp_plan_id: user_idp_plan.id
        )
      end

      before do
        create_list(:user_idp_development_action, 3, user_idp_plan: user_idp_plan, user_idp_skill: user_idp_skill)
      end

      it 'deletes all development actions for the plan' do
        expect { subject }.to change { UserIdpDevelopmentAction.count }.by(-3)
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when all development_actions have _destroy flag' do
      let(:development_actions) do
        [
          { user_idp_skill_id: user_idp_skill.id, _destroy: '1' },
          { user_idp_skill_id: user_idp_skill.id, _destroy: true }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      before do
        create_list(:user_idp_development_action, 2, user_idp_plan: user_idp_plan, user_idp_skill: user_idp_skill)
      end

      it 'deletes all development actions for the plan' do
        expect { subject }.to change { UserIdpDevelopmentAction.count }.by(-2)
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when creating new records' do
      let(:development_actions) do
        [
          {
            user_idp_skill_id: user_idp_skill.id,
            development_action_id: development_action.id,
            user_idp_plan_id: user_idp_plan.id,
            progress: 50,
            start_date_time: '2024-01-01',
            end_date_time: '2024-01-31'
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'creates new development actions' do
        expect { subject }.to change { UserIdpDevelopmentAction.count }.by(1)
      end

      it 'broadcasts ok and creates record with correct attributes' do
        expect { subject }.to broadcast(:ok)

        created_record = UserIdpDevelopmentAction.last
        expect(created_record.user_idp_skill_id).to eq(user_idp_skill.id)
        expect(created_record.development_action_id).to eq(development_action.id)
        expect(created_record.progress).to eq(50)
      end
    end

    context 'when updating existing records' do
      let!(:existing_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill,
               progress: 25)
      end

      let(:development_actions) do
        [
          {
            id: existing_action.id,
            user_idp_skill_id: user_idp_skill.id,
            progress: 75,
            start_date_time: '2024-02-01'
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'updates existing development actions' do
        expect { subject }.not_to(change { UserIdpDevelopmentAction.count })
        existing_action.reload
        expect(existing_action.progress).to eq(75)
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when mixing create, update, and delete operations' do
      let!(:existing_action_to_update) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill,
               progress: 25)
      end

      let!(:existing_action_to_delete) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill)
      end

      let(:development_actions) do
        [
          # Update existing
          {
            id: existing_action_to_update.id,
            user_idp_skill_id: user_idp_skill.id,
            progress: 90
          },
          # Create new
          {
            user_idp_skill_id: user_idp_skill.id,
            development_action_id: development_action.id,
            user_idp_plan_id: user_idp_plan.id,
            progress: 10
          },
          # Delete specific
          {
            id: existing_action_to_delete.id,
            user_idp_skill_id: user_idp_skill.id,
            _destroy: '1'
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'performs all operations correctly' do
        expect { subject }.to change { UserIdpDevelopmentAction.count }.by(0) # +1 create, -1 delete

        # Check update worked
        existing_action_to_update.reload
        expect(existing_action_to_update.progress).to eq(90)

        # Check delete worked
        expect { existing_action_to_delete.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when handling multiple skills' do
      let(:skill2) { create(:skill, project: project) }
      let(:user_idp_skill2) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill2) }

      let!(:existing_for_skill1) do
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, user_idp_skill: user_idp_skill)
      end

      let!(:existing_for_skill2) do
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, user_idp_skill: user_idp_skill2)
      end

      let(:development_actions) do
        [
          # Keep existing for skill1 by including it
          {
            id: existing_for_skill1.id,
            user_idp_skill_id: user_idp_skill.id,
            progress: 50
          },
          # Create new for skill2, existing_for_skill2 will be deleted
          {
            user_idp_skill_id: user_idp_skill2.id,
            development_action_id: development_action.id,
            user_idp_plan_id: user_idp_plan.id,
            progress: 30
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'handles multiple skills correctly' do
        expect { subject }.to change { UserIdpDevelopmentAction.count }.by(0) # +1 create, -1 delete

        # existing_for_skill1 should be updated
        existing_for_skill1.reload
        expect(existing_for_skill1.progress).to eq(50)

        # existing_for_skill2 should be deleted (not in payload for skill2)
        expect { existing_for_skill2.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when record validation fails' do
      let(:development_actions) do
        [
          {
            user_idp_skill_id: user_idp_skill.id,
            custom_action: 'test',
            user_idp_plan_id: user_idp_plan.id
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when record is not found' do
      let(:development_actions) do
        [
          {
            id: 999_999, # Non-existent ID
            user_idp_skill_id: user_idp_skill.id,
            progress: 50
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'broadcasts ok' do
        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when user_idp_skill_id is blank' do
      let(:development_actions) do
        [
          {
            user_idp_skill_id: nil,
            development_action_id: development_action.id,
            user_idp_plan_id: user_idp_plan.id
          }
        ]
      end

      subject do
        described_class.call(
          user_idp_development_actions: development_actions,
          user_idp_plan_id: user_idp_plan.id
        )
      end

      it 'skips processing development_actions with blank skill id' do
        expect { subject }.not_to(change { UserIdpDevelopmentAction.count })
      end
    end
  end
end
