# frozen_string_literal: true

require 'rails_helper'

describe Idp::Skill::AddDevelopmentActions do
  let(:user) { create(:user) }
  let!(:client) { create(:tenancy) }
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:skill_settings) do
    { 'technical_client' => 'none', 'technical_global' => 'all',
      'behavioral_client' => 'none', 'behavioral_global' => 'all' }
  end
  let(:idp_template) { create(:idp_template, :published, project: project, skill_settings: skill_settings) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }

  let!(:skill1) { create(:skill, name: 'Leadership', skill_type: 'behavioral', project: nil) }
  let!(:skill2) { create(:skill, name: 'Communication', skill_type: 'behavioral', project: nil) }
  let!(:skill3) { create(:skill, name: 'Technical Writing', skill_type: 'technical', project: nil) }

  let!(:development_action1) { create(:development_action, name: 'Leadership Workshop', skills: [skill1]) }
  let!(:development_action2) { create(:development_action, name: 'Communication Training', skills: [skill2]) }
  let!(:development_action3) { create(:development_action, name: 'Technical Course', skills: [skill3]) }

  let!(:user_idp_skill1) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill1) }
  let!(:user_idp_skill2) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill2) }
  let!(:user_idp_skill3) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill3) }

  describe '#call' do
    context 'adding development actions to a skill with no existing actions' do
      let(:development_actions_params) do
        [
          {
            'development_action_id' => development_action1.id
          }
        ]
      end

      it 'creates the development action association successfully' do
        described_class.call!(user_idp_plan, user_idp_skill1, development_actions_params)

        expect(user_idp_plan.user_idp_development_actions.count).to eq(1)

        action = user_idp_plan.user_idp_development_actions.first
        expect(action.development_action_id).to eq(development_action1.id)
        expect(action.user_idp_skill_id).to eq(user_idp_skill1.id)
      end
    end

    context 'adding custom development actions' do
      let(:development_actions_params) do
        [
          {
            'name' => 'Custom Leadership Training',
            'description' => 'Weekly leadership sessions',
            'learning_style' => 'structured_learning',
            'progress' => 25,
            'private' => true,
            'source_type' => 'ai_generated'
          }
        ]
      end

      it 'creates ai_generated development action and association' do
        described_class.call!(user_idp_plan, user_idp_skill1, development_actions_params)

        expect(user_idp_plan.user_idp_development_actions.count).to eq(1)

        action_record = user_idp_plan.user_idp_development_actions.first
        custom_action = action_record.development_action

        expect(custom_action.name).to eq('Custom Leadership Training')
        expect(custom_action.description).to eq('Weekly leadership sessions')
        expect(custom_action.learning_style).to eq('structured_learning')
        expect(custom_action.source_type).to eq('ai_generated')
        expect(custom_action.owner).to eq(user_idp_plan)

        expect(action_record.user_idp_skill_id).to eq(user_idp_skill1.id)
        expect(action_record.progress).to eq(25)
        expect(action_record.private).to be_truthy
      end

      it 'defaults source_type to custom when not provided' do
        development_actions_params[0].delete('source_type')

        described_class.call!(user_idp_plan, user_idp_skill1, development_actions_params)

        custom_action = user_idp_plan.user_idp_development_actions.first.development_action
        expect(custom_action.source_type).to eq('custom')
      end
    end

    context 'adding mixed existing and custom development actions' do
      let(:development_actions_params) do
        [
          {
            'development_action_id' => development_action1.id,
            'progress' => 15
          },
          {
            'name' => 'Custom Mentoring',
            'description' => 'One-on-one mentoring',
            'learning_style' => 'learning_from_others',
            'progress' => 30
          }
        ]
      end

      it 'creates both existing and custom development actions' do
        described_class.call!(user_idp_plan, user_idp_skill1, development_actions_params)

        expect(user_idp_plan.user_idp_development_actions.count).to eq(2)

        # Check existing action
        existing_action = user_idp_plan.user_idp_development_actions.
                          find_by(development_action_id: development_action1.id)
        expect(existing_action).to be_present
        expect(existing_action.progress).to eq(15)
        expect(existing_action.user_idp_skill_id).to eq(user_idp_skill1.id)

        # Check custom action
        custom_action_record = user_idp_plan.user_idp_development_actions.joins(:development_action).
                               find_by(development_actions: { name: 'Custom Mentoring' })
        expect(custom_action_record).to be_present
        expect(custom_action_record.progress).to eq(30)
        expect(custom_action_record.development_action.source_type).to eq('custom')
      end
    end

    context 'replacing existing development actions' do
      let!(:existing_user_idp_dev_action1) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill1,
               development_action: development_action1,
               progress: 50)
      end

      let!(:existing_user_idp_dev_action2) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill1,
               development_action: development_action2,
               progress: 75)
      end

      let(:new_development_actions_params) do
        [
          {
            'development_action_id' => development_action3.id,
            'progress' => 20
          }
        ]
      end

      it 'clears existing actions and adds new ones for the skill' do
        # Verify initial state
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).count).to eq(2)

        described_class.call!(user_idp_plan, user_idp_skill1, new_development_actions_params)

        # Verify old actions for skill1 are removed
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).count).to eq(1)

        # Verify new action is added
        new_action = user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).first
        expect(new_action.development_action_id).to eq(development_action3.id)
        expect(new_action.progress).to eq(20)

        # Verify old actions no longer exist
        expect(UserIdpDevelopmentAction.find_by(id: existing_user_idp_dev_action1.id)).to be_nil
        expect(UserIdpDevelopmentAction.find_by(id: existing_user_idp_dev_action2.id)).to be_nil
      end
    end

    context 'isolation - other skills are not affected' do
      let!(:existing_skill1_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill1,
               development_action: development_action1,
               progress: 40)
      end

      let!(:existing_skill2_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill2,
               development_action: development_action2,
               progress: 60)
      end

      let!(:existing_skill3_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill3,
               development_action: development_action3,
               progress: 80)
      end

      let(:new_skill1_actions) do
        [
          {
            'name' => 'New Leadership Action',
            'description' => 'New leadership training',
            'learning_style' => 'on_the_job',
            'progress' => 10
          }
        ]
      end

      it 'only modifies the target skill and leaves others unchanged' do
        # Verify initial state
        expect(user_idp_plan.user_idp_development_actions.count).to eq(3)
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).count).to eq(1)
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill2).count).to eq(1)
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill3).count).to eq(1)

        described_class.call!(user_idp_plan, user_idp_skill1, new_skill1_actions)

        # Verify total count remains the same (1 removed from skill1, 1 added to skill1)
        expect(user_idp_plan.user_idp_development_actions.count).to eq(3)

        # Verify skill1 has new action
        skill1_actions = user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1)
        expect(skill1_actions.count).to eq(1)
        new_action = skill1_actions.first
        expect(new_action.development_action.name).to eq('New Leadership Action')
        expect(new_action.progress).to eq(10)

        # Verify skill2 is unchanged
        skill2_actions = user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill2)
        expect(skill2_actions.count).to eq(1)
        skill2_action = skill2_actions.first
        expect(skill2_action.id).to eq(existing_skill2_action.id) # Same record
        expect(skill2_action.development_action_id).to eq(development_action2.id)
        expect(skill2_action.progress).to eq(60)

        # Verify skill3 is unchanged
        skill3_actions = user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill3)
        expect(skill3_actions.count).to eq(1)
        skill3_action = skill3_actions.first
        expect(skill3_action.id).to eq(existing_skill3_action.id) # Same record
        expect(skill3_action.development_action_id).to eq(development_action3.id)
        expect(skill3_action.progress).to eq(80)

        # Verify original skill1 action was removed
        expect(UserIdpDevelopmentAction.find_by(id: existing_skill1_action.id)).to be_nil
      end
    end

    context 'with empty development actions array' do
      let!(:existing_action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill1,
               development_action: development_action1)
      end

      subject { described_class.new(user_idp_plan, user_idp_skill1, []) }

      it 'clears all development actions for the skill' do
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).count).to eq(1)

        described_class.call!(user_idp_plan, user_idp_skill1, [])
        expect(user_idp_plan.user_idp_development_actions.where(user_idp_skill: user_idp_skill1).count).to eq(0)
        expect(UserIdpDevelopmentAction.find_by(id: existing_action.id)).to be_nil
      end
    end

    context 'with date/time parameters' do
      let(:start_time) { 1.week.from_now.strftime('%Y-%m-%d %H:%M') }
      let(:end_time) { 2.weeks.from_now.strftime('%Y-%m-%d %H:%M') }

      let(:development_actions_params) do
        [
          {
            'development_action_id' => development_action1.id,
            'start_date_time' => start_time,
            'end_date_time' => end_time
          }
        ]
      end

      it 'correctly sets start and end times' do
        described_class.call!(user_idp_plan, user_idp_skill1, development_actions_params)

        action_record = user_idp_plan.user_idp_development_actions.first
        expect(action_record.start_date_time.strftime('%Y-%m-%d %H:%M')).to eq(start_time)
        expect(action_record.end_date_time.strftime('%Y-%m-%d %H:%M')).to eq(end_time)
      end
    end
  end
end
