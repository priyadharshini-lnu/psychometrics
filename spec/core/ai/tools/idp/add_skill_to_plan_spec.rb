# frozen_string_literal: true

require 'rails_helper'

describe AI::Tools::Idp::AddSkillToPlan do
  subject { described_class.new(user_idp_plan) }

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

  before do
    project.project_feature&.update(global_skills: true)
  end

  let!(:skill1) { create(:skill, name: 'Leadership', skill_type: 'behavioral', project: nil) }
  let!(:skill2) { create(:skill, name: 'Communication', skill_type: 'behavioral', project: nil) }
  let!(:skill3) { create(:skill, name: 'Technical Writing', skill_type: 'technical', project: nil) }

  let!(:development_action1) { create(:development_action, name: 'Leadership Workshop', skills: [skill1]) }
  let!(:development_action2) { create(:development_action, name: 'Communication Training', skills: [skill2]) }

  describe '#execute' do
    context 'with valid skill_id and existing development actions' do
      let(:development_actions) do
        [
          {
            'development_action_id' => development_action1.id
          }
        ]
      end

      it 'adds skill and development actions successfully' do
        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:skill_id]).to eq(skill1.id)
        expect(result[:skill_name]).to eq('Leadership')
        expect(result[:actions_count]).to eq(1)
        expect(result[:status]).to eq('draft')
      end

      it 'changes the plan status to draft' do
        user_idp_plan.update!(status: :not_started)
        expect do
          subject.execute(skill_id: skill1.id, development_actions: development_actions)
        end.to change { user_idp_plan.reload.status }.to('draft')
      end

      it 'creates user_idp_skill for the specified skill' do
        subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(user_idp_plan.user_idp_skills.count).to eq(1)
        expect(user_idp_plan.user_idp_skills.first.skill_id).to eq(skill1.id)
      end

      it 'creates user_idp_development_action' do
        subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(user_idp_plan.user_idp_development_actions.count).to eq(1)
        expect(user_idp_plan.user_idp_development_actions.first.development_action_id).to eq(development_action1.id)
      end
    end

    context 'with valid skill_id and custom development actions' do
      let(:development_actions) do
        [
          {
            'name' => 'Custom Leadership Training',
            'description' => 'Attend weekly leadership sessions',
            'learning_style' => 'structured_learning'
          }
        ]
      end

      it 'adds skill and custom development actions successfully' do
        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:skill_id]).to eq(skill1.id)
        expect(result[:skill_name]).to eq('Leadership')
        expect(result[:actions_count]).to eq(1)
        expect(result[:status]).to eq('draft')
      end

      it 'creates ai_generated development action' do
        subject.execute(skill_id: skill1.id, development_actions: development_actions)

        custom_action = user_idp_plan.user_idp_development_actions.first.development_action
        expect(custom_action.name).to eq('Custom Leadership Training')
        expect(custom_action.description).to eq('Attend weekly leadership sessions')
        expect(custom_action.learning_style).to eq('structured_learning')
        expect(custom_action.source_type).to eq('ai_generated')
      end
    end

    context 'with mixed existing and custom development actions' do
      let(:future_date) { 1.week.from_now.strftime('%Y-%m-%d %H:%M') }

      let(:development_actions) do
        [
          {
            'development_action_id' => development_action1.id
          },
          {
            'name' => 'Custom Mentorship Program',
            'description' => 'Monthly mentoring sessions',
            'learning_style' => 'learning_from_others',
            'start_date_time' => future_date
          }
        ]
      end

      it 'adds skill with both existing and custom actions' do
        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:actions_count]).to eq(2)

        actions = user_idp_plan.user_idp_development_actions.includes(:development_action)
        expect(actions.count).to eq(2)

        # Check existing action
        existing_action = actions.find { |a| a.development_action_id == development_action1.id }
        expect(existing_action).to be_present

        # Check custom action
        custom_action = actions.find { |a| a.development_action.name == 'Custom Mentorship Program' }
        expect(custom_action).to be_present
        expect(custom_action.development_action.source_type).to eq('ai_generated')
      end
    end

    context 'with multiple development actions' do
      let(:development_actions) do
        [
          {
            'development_action_id' => development_action1.id
          },
          {
            'name' => 'Custom Action 1',
            'description' => 'Custom description 1',
            'learning_style' => 'on_the_job'
          },
          {
            'name' => 'Custom Action 2',
            'description' => 'Custom description 2',
            'learning_style' => 'structured_learning'
          }
        ]
      end

      it 'creates multiple development actions successfully' do
        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result[:actions_count]).to eq(3)
        expect(user_idp_plan.user_idp_development_actions.count).to eq(3)
      end
    end

    context 'with invalid skill_id' do
      let(:development_actions) do
        [
          {
            'development_action_id' => development_action1.id
          }
        ]
      end

      it 'returns error when skill_id is blank' do
        result = subject.execute(skill_id: nil, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('skill_id is required')
      end

      it 'returns error when skill_id is not available in template' do
        unavailable_skill = create(:skill)

        result = subject.execute(skill_id: unavailable_skill.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).
          to include("Skill with ID '#{unavailable_skill.id}' is not available in the IDP template")
      end
    end

    context 'with invalid development_actions structure' do
      it 'returns error when development_actions is not an array' do
        result = subject.execute(skill_id: skill1.id, development_actions: '{}')

        expect(result).to have_key(:error)
        expect(result[:error]).to include('development_actions must be an array')
      end

      it 'returns error when development action is not a hash' do
        result = subject.execute(skill_id: skill1.id, development_actions: ['not_a_hash'])

        expect(result).to have_key(:error)
        expect(result[:error]).to include('must be a hash')
      end

      it 'returns error when action has neither development_action_id nor custom fields' do
        development_actions = [{}]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('must have either development_action_id')
      end

      it 'returns error when custom action is missing name' do
        development_actions = [
          {
            'description' => 'Test description',
            'learning_style' => 'on_the_job'
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('must have a name')
      end

      it 'returns error when custom action is missing description' do
        development_actions = [
          {
            'name' => 'Custom Action',
            'learning_style' => 'on_the_job'
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('must have a description')
      end

      it 'returns error when custom action is missing learning_style' do
        development_actions = [
          {
            'name' => 'Custom Action',
            'description' => 'Test description'
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('must have a learning_style')
      end

      it 'returns error when custom action has invalid learning_style' do
        development_actions = [
          {
            'name' => 'Custom Action',
            'description' => 'Test description',
            'learning_style' => 'invalid_style'
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include(
          'learning_style must be one of: on_the_job, learning_from_others, structured_learning'
        )
      end
    end

    context 'with development action validation errors' do
      it 'returns error for dates in the past' do
        past_date = 1.week.ago.strftime('%Y-%m-%d %H:%M')

        development_actions = [
          {
            'name' => 'Custom Action',
            'description' => 'Test description',
            'learning_style' => 'on_the_job',
            'start_date_time' => past_date
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('start_date_time')
      end

      it 'returns formatted validation errors for multiple actions' do
        past_date = 1.week.ago.strftime('%Y-%m-%d %H:%M')

        development_actions = [
          {
            'name' => 'Action 1',
            'description' => 'Description 1',
            'learning_style' => 'on_the_job',
            'start_date_time' => past_date
          },
          {
            'name' => 'Action 2',
            'description' => 'Description 2',
            'learning_style' => 'on_the_job',
            'start_date_time' => past_date
          }
        ]

        result = subject.execute(skill_id: skill1.id, development_actions: development_actions)

        expect(result).to have_key(:error)
        expect(result[:error]).to include('Development Action 1')
        expect(result[:error]).to include('Development Action 2')
      end
    end

    context 'when updating existing skill' do
      let(:new_development_actions) do
        [
          {
            'name' => 'New Custom Action',
            'description' => 'New custom description',
            'learning_style' => 'learning_from_others'
          }
        ]
      end

      before do
        user_idp_skill1 = create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill1)
        user_idp_skill2 = create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill2)
        create(:user_idp_development_action, user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill1, development_action: development_action1)
        create(:user_idp_development_action, user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill2, development_action: development_action2)
      end

      it 'replaces existing development actions for the skill' do
        # Verify initial state
        expect(user_idp_plan.user_idp_development_actions.count).to eq(2)
        skill1_actions = user_idp_plan.user_idp_development_actions.
                         joins(:user_idp_skill).
                         where(user_idp_skills: { skill_id: skill1.id })
        expect(skill1_actions.count).to eq(1)
        expect(skill1_actions.first.development_action_id).to eq(development_action1.id)

        # Update skill1 with new development actions
        result = subject.execute(skill_id: skill1.id, development_actions: new_development_actions)

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:actions_count]).to eq(1)

        # Verify total count remains the same (1 replaced + 1 from skill2)
        expect(user_idp_plan.user_idp_development_actions.count).to eq(2)

        # Verify skill1's old action is replaced with new custom action
        updated_skill1_actions = user_idp_plan.user_idp_development_actions.
                                 joins(:user_idp_skill).
                                 where(user_idp_skills: { skill_id: skill1.id })
        expect(updated_skill1_actions.count).to eq(1)

        new_action = updated_skill1_actions.first.development_action
        expect(new_action.name).to eq('New Custom Action')
        expect(new_action.description).to eq('New custom description')
        expect(new_action.learning_style).to eq('learning_from_others')
        expect(new_action.source_type).to eq('ai_generated')

        # Verify the old action is no longer associated with skill1
        expect(updated_skill1_actions.first.development_action_id).not_to eq(development_action1.id)
      end

      it 'does not affect other skills development actions' do
        # Update skill1 with new development actions
        subject.execute(skill_id: skill1.id, development_actions: new_development_actions)

        # Verify skill2's actions remain unchanged
        skill2_actions = user_idp_plan.user_idp_development_actions.
                         joins(:user_idp_skill).
                         where(user_idp_skills: { skill_id: skill2.id })
        expect(skill2_actions.count).to eq(1)
        expect(skill2_actions.first.development_action_id).to eq(development_action2.id)
      end

      it 'can clear all development actions for a skill' do
        # Update skill1 with empty development actions
        result = subject.execute(skill_id: skill1.id, development_actions: [])

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:actions_count]).to eq(0)

        # Verify skill1 has no development actions
        skill1_actions = user_idp_plan.user_idp_development_actions.
                         joins(:user_idp_skill).
                         where(user_idp_skills: { skill_id: skill1.id })
        expect(skill1_actions.count).to eq(0)

        # Verify skill2's actions remain unchanged
        skill2_actions = user_idp_plan.user_idp_development_actions.
                         joins(:user_idp_skill).
                         where(user_idp_skills: { skill_id: skill2.id })
        expect(skill2_actions.count).to eq(1)
        expect(skill2_actions.first.development_action_id).to eq(development_action2.id)

        # Verify total count is now 1 (only skill2's action)
        expect(user_idp_plan.user_idp_development_actions.count).to eq(1)
      end
    end

    context 'with empty development_actions array' do
      it 'creates skill without development actions' do
        result = subject.execute(skill_id: skill1.id, development_actions: [])

        expect(result[:message]).to eq('Skill and development actions added successfully')
        expect(result[:actions_count]).to eq(0)
        expect(user_idp_plan.user_idp_skills.count).to eq(1)
        expect(user_idp_plan.user_idp_development_actions.count).to eq(0)
      end
    end
  end

  describe 'retry behavior with disabled error raising' do
    context 'when maximum retry attempts are exceeded' do
      it 'returns error hash instead of raising MaximumRetryAttemptsExceededError' do
        tool_instance = described_class.new(user_idp_plan)

        max_retries = described_class.max_retries
        # Use invalid development_actions that will cause JSON::ParserError during processing
        invalid_development_actions = 'invalid_actions'

        (1..max_retries).each do |_attempt|
          result = tool_instance.execute(skill_id: skill1.id, development_actions: invalid_development_actions)

          expect(result).to be_a(Hash)
          expect(result).to have_key(:error)
          expect(result[:error]).to be_a(String)
        end

        final_result = tool_instance.execute(skill_id: skill1.id, development_actions: invalid_development_actions)

        expect(final_result).to be_a(Hash)
        expect(final_result).to have_key(:error)
        expect(final_result[:error]).to include('exceeded maximum retry attempts')
        expect(final_result[:error]).to include(described_class.name)
        expect(final_result[:error]).to include((max_retries + 1).to_s)
      end

      it 'does not raise MaximumRetryAttemptsExceededError exception' do
        tool_instance = described_class.new(user_idp_plan)
        invalid_development_actions = 'invalid_actions'

        (1..(described_class.max_retries + 1)).each do |_attempt|
          expect do
            tool_instance.execute(skill_id: skill1.id, development_actions: invalid_development_actions)
          end.not_to raise_error
        end
      end
    end
  end
end
