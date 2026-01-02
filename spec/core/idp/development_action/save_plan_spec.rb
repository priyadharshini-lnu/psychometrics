# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SavePlan do
  let(:user) { create(:user) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template, approval_status: :draft) }
  let(:skills) { create_list(:skill, 3) }
  let(:development_action) { create(:development_action) }
  let(:available_development_action) { create(:development_action) }
  let!(:user_idp_skills) do
    skills.map { |skill| create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  end
  let!(:idp_template_development_action) do
    create(:idp_template_development_action, idp_template: idp_template,
    development_action: development_action)
  end
  let!(:user_idp_development_action) do
    create(:user_idp_development_action, user_idp_plan: user_idp_plan,
          user_idp_skill: user_idp_skills.first, development_action: development_action)
  end
  let(:custom_development_action) do
    create(:user_idp_development_action, :with_custom_development_action, user_idp_plan: user_idp_plan,
    user_idp_skill: user_idp_skills.last)
  end

  context 'User idp development action' do
    it 'creates user idp development action on passing development action id' do
      body_params =
        [
          {
            'id' => nil,
            'development_action_id' => available_development_action.id,
            'user_idp_skill_id' => user_idp_skills.first.id,
            'custom_action' => '',
            'progress' => 77,
            'start_date_time' => '2024-03-28 15:45',
            'end_date_time' => '2024-03-30 15:45',
            'private' => false
          }
        ]

      described_class.call!(user_idp_plan, body_params, user)
      user_idp_development_action = UserIdpDevelopmentAction.find_by(
        development_action_id: available_development_action.id,
        user_idp_plan: user_idp_plan
      )
      expect(user_idp_development_action).to be_present
      expect(user_idp_development_action.progress).to eq(77)
      expect(user_idp_development_action.private).to eq(false)
    end

    it 'updates user idp development action on passing user idp development action id' do
      body_params =
        [
          {
            'id' => user_idp_development_action.id,
            'development_action_id' => development_action.id,
            'user_idp_skill_id' => user_idp_skills.first.id,
            'custom_action' => '',
            'progress' => 77,
            'start_date_time' => '2024-03-28 15:45',
            'end_date_time' => '2024-03-30 15:45',
            'private' => false
          }
        ]

      described_class.call!(user_idp_plan, body_params, user)
      user_idp_development_action.reload
      expect(user_idp_development_action.private).to eq(false)
      expect(user_idp_development_action.progress).to eq(77)
    end
  end

  context 'destroy user idp development action' do
    before do
      @development_action = create(:development_action)
      @user_idp_development_action = create(:user_idp_development_action, user_idp_plan: user_idp_plan,
              user_idp_skill: user_idp_skills.first, development_action: @development_action)
    end

    it 'destroy removed development actions from payload' do
      # Send an empty payload to trigger removal of all existing actions
      body_params = []

      expect(user_idp_plan.user_idp_development_actions.count).to be > 0
      described_class.call!(user_idp_plan, body_params, user)

      # Reload the plan to ensure we have fresh data
      user_idp_plan.reload

      # Expect all development actions to be removed when payload is empty
      expect(user_idp_plan.user_idp_development_actions.count).to eq(0)
      expect(UserIdpDevelopmentAction.exists?(@user_idp_development_action.id)).to be false
    end

    it 'soft deletes removed development actions which was present in approved plan' do
      Timecop.travel(1.minute.ago) do
        @user_idp_development_action_in_approved_plan = create(
          :user_idp_development_action,
          user_idp_plan: user_idp_plan,
          user_idp_skill: user_idp_skills.last,
          development_action: @development_action
        )
      end

      PaperTrail.request.enable_model(UserIdpPlan)
      user_idp_plan.approve!
      user_idp_plan.draft!

      body_params = []

      described_class.call!(user_idp_plan, body_params, user)
      user_idp_plan.reload

      expect(@user_idp_development_action_in_approved_plan.reload.deleted_at).not_to be_nil
    end

    it 'destroys removed development actions which added after plan approval' do
      Timecop.travel(1.minute.ago) do
        @user_idp_development_action_in_approved_plan = create(
          :user_idp_development_action,
          user_idp_plan: user_idp_plan,
          user_idp_skill: user_idp_skills.last,
          development_action: @development_action
        )
      end

      PaperTrail.request.enable_model(UserIdpPlan)
      user_idp_plan.approve!
      user_idp_plan.draft!

      new_development_action = create(:development_action)
      new_user_idp_development_action = create(
        :user_idp_development_action,
        user_idp_plan: user_idp_plan,
        user_idp_skill: user_idp_skills.first,
        development_action: new_development_action
      )

      body_params = []

      described_class.call!(user_idp_plan, body_params, user)
      user_idp_plan.reload

      expect(@user_idp_development_action_in_approved_plan.reload.deleted_at).not_to be_nil
      expect(UserIdpDevelopmentAction.exists?(new_user_idp_development_action.id)).to be false
    end
  end

  context 'custom development action' do
    it 'creates custom development action' do
      body_params = [{
        'id' => nil,
        'development_action_id' => nil,
        'user_idp_skill_id' => user_idp_skills.last.id,
        'name' => 'New custom action name',
        'description' => 'New Update custom action',
        'learning_style' => 'on_the_job',
        'source_type' => 'custom',
        'progress' => 77,
        'start_date_time' => '2024-03-28 15:45',
        'end_date_time' => '2024-03-30 15:45',
        'private' => false
      }]

      described_class.call!(user_idp_plan, body_params, user)
      user_idp_development_action = UserIdpDevelopmentAction.joins(:development_action).
                                    where(development_actions: {
                                      description: 'New Update custom action', source_type: 'custom'
                                    }).
                                    first
      expect(user_idp_development_action).to be_present
      expect(user_idp_development_action.development_action.name).to eq('New custom action name')
      expect(user_idp_development_action.progress).to be(77)
      expect(user_idp_development_action.private).to eq(false)
      expect(user_idp_development_action.development_action.learning_style).to eq('on_the_job')
      expect(user_idp_development_action.development_action.source_type).to eq('custom')
    end

    it 'updates custom development action' do
      custom_development_action = create(:user_idp_development_action, :with_custom_development_action,
                                         user_idp_plan: user_idp_plan,
                                         user_idp_skill: user_idp_skills.last)

      body_params = [{
        'id' => custom_development_action.id,
        'development_action_id' => nil,
        'user_idp_skill_id' => user_idp_skills.last.id,
        'name' => 'Updated custom action name',
        'description' => 'Updated custom development action',
        'learning_style' => 'structured_learning',
        'progress' => 100,
        'start_date_time' => '2024-03-28 15:45',
        'end_date_time' => '2024-03-30 15:45',
        'private' => false
      }]

      described_class.call!(user_idp_plan, body_params, user)
      custom_development_action.reload
      expect(custom_development_action.development_action.description).to eq('Updated custom development action')
      expect(custom_development_action.development_action.learning_style).to eq('structured_learning')
    end
  end
end
