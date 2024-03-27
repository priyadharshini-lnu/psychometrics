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

  it 'creates user idp development action on passing development action id' do
    body_params =
      [
        {
          user_idp_skill_id: user_idp_skills.last.id,
          user_idp_development_actions_attributes: [
            {
              development_action_id: available_development_action.id,
              start_date_time: '2024-03-28 15:45',
              end_date_time: '2024-03-29 15:45',
              private: true,
              progress: 50
            }
          ]
        }
      ]

    described_class.call!(user_idp_plan, body_params)
    user_idp_development_action = UserIdpDevelopmentAction.find(available_development_action.id)
    expect(user_idp_development_action).to be_present
  end

  it 'updates user idp development action on passing user idp development action id' do
    body_params =
      [
        {
          user_idp_skill_id: user_idp_skills.first.id,
          user_idp_development_actions_attributes: [
            {
              id: user_idp_development_action.id,
              private: true,
              progress: 75
            }
          ]
        }
      ]

    described_class.call!(user_idp_plan, body_params)
    user_idp_development_action.reload
    expect(user_idp_development_action.private).to eq(true)
    expect(user_idp_development_action.progress).to eq(75)
  end

  it 'destroy user idp development action on passing destroy flag' do
    body_params =
      [
        {
          user_idp_skill_id: user_idp_skills.first.id,
          user_idp_development_actions_attributes: [
            {
              id: user_idp_development_action.id,
              _destroy: true
            }
          ]
        }
      ]

    deleted_user_idp_development_action_id = user_idp_development_action.id
    described_class.call!(user_idp_plan, body_params)
    expect { UserIdpDevelopmentAction.find(deleted_user_idp_development_action_id) }.
      to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'creates custom development action' do
    body_params =
      [
        {
          user_idp_skill_id: user_idp_skills.first.id,
          user_idp_development_actions_attributes: [
            {
              custom_action: 'Testing custom action creation',
              start_date_time: '2024-03-28 15:45',
              end_date_time: '2024-03-29 15:45',
              private: false,
              progress: 76
            }
          ]
        }
      ]

    described_class.call!(user_idp_plan, body_params)
    user_idp_development_action = UserIdpDevelopmentAction.find_by(custom_action: 'Testing custom action creation')
    expect(user_idp_development_action).to be_present
    expect(user_idp_development_action.private).to be(false)
    expect(user_idp_development_action.progress).to eq(76)
  end
end
