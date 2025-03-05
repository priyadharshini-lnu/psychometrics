# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SavePlan do
  let(:user) { create(:user) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
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

      described_class.call!(user_idp_plan, body_params)
      user_idp_development_action = UserIdpDevelopmentAction.find_by(
        development_action_id: available_development_action.id,
        user_idp_skill_id: user_idp_skills.first.id
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

      described_class.call!(user_idp_plan, body_params)
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
      body_params =
        [
          {
            'id' => @user_idp_development_action.id,
            'development_action_id' => @development_action.id,
            'user_idp_skill_id' => user_idp_skills.first.id,
            'custom_action' => @user_idp_development_action.custom_action,
            'progress' => @user_idp_development_action.progress,
            'start_date_time' => @user_idp_development_action.start_date_time,
            'end_date_time' => @user_idp_development_action.end_date_time,
            'private' => @user_idp_development_action.private
          }
        ]

      development_action_count = user_idp_plan.user_idp_development_actions.count
      described_class.call!(user_idp_plan, body_params)
      expect(user_idp_plan.user_idp_development_actions.count).to be(development_action_count - 1)
      expect(user_idp_plan.user_idp_development_actions.ids).not_to include(development_action.id)
    end
  end

  context 'custom development action' do
    it 'creates custom development action' do
      body_params =
        [
          {
            'id' => nil,
            'development_action_id' => nil,
            'user_idp_skill_id' => user_idp_skills.last.id,
            'custom_action' => 'New Update custom action',
            'progress' => 77,
            'start_date_time' => '2024-03-28 15:45',
            'end_date_time' => '2024-03-30 15:45',
            'private' => false
          }
        ]

      described_class.call!(user_idp_plan, body_params)
      user_idp_development_action = UserIdpDevelopmentAction.find_by(custom_action: 'New Update custom action')
      expect(user_idp_development_action).to be_present
      expect(user_idp_development_action.progress).to be(77)
      expect(user_idp_development_action.private).to eq(false)
    end

    it 'updates custom development action' do
      body_params =
        [
          {
            'id' => custom_development_action.id,
            'development_action_id' => nil,
            'user_idp_skill_id' => user_idp_skills.last.id,
            'custom_action' => 'Updated custom development action',
            'progress' => 100,
            'start_date_time' => '2024-03-28 15:45',
            'end_date_time' => '2024-03-30 15:45',
            'private' => false
          }
        ]

      described_class.call!(user_idp_plan, body_params)
      custom_development_action.reload
      expect(custom_development_action.custom_action).to eq('Updated custom development action')
    end
  end
end
