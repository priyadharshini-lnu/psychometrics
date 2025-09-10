# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpDevelopmentAction, type: :model do
  let(:user) { create(:user, :with_project_membership) }
  let(:project) { Project.find(user.project.id) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skill) { create(:skill, project: project) }
  let(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  let(:development_action) { create(:development_action) }

  describe 'associations' do
    it { is_expected.to belong_to(:user_idp_plan) }
    it { is_expected.to belong_to(:development_action).optional }
    it { is_expected.to belong_to(:user_idp_skill) }
    it { is_expected.to have_one(:skill).through(:user_idp_skill) }
    it { is_expected.to have_one(:user).through(:user_idp_plan) }
  end

  describe '#learning_style' do
    it 'returns learning_style from development_action' do
      user_idp_development_action = create(:user_idp_development_action, development_action: development_action)
      expect(user_idp_development_action.learning_style).to eq(development_action.learning_style)
    end

    it 'returns nil when no development_action' do
      user_idp_development_action = build(:user_idp_development_action,
                                          user_idp_plan: user_idp_plan,
                                          user_idp_skill: user_idp_skill,
                                          development_action: nil)
      user_idp_development_action.save!(validate: false)
      expect(user_idp_development_action.learning_style).to be_nil
    end
  end
end
