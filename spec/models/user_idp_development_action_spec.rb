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

  describe 'enums' do
    it {
      is_expected.to define_enum_for(
        :custom_action_learning_style
      ).with_values(on_the_job: 0, learning_from_others: 1, structured_learning: 2)
    }
  end

  describe 'validations' do
    context 'when custom_action is present' do
      let(:action) do
        build(:user_idp_development_action,
              user_idp_plan: user_idp_plan,
              user_idp_skill: user_idp_skill,
              custom_action: 'Custom task',
              custom_action_learning_style: nil)
      end

      it 'requires custom_action_learning_style' do
        expect(action).not_to be_valid
        expect(action.errors[:custom_action_learning_style]).to include("can't be blank")
      end

      it 'is valid with custom_action_learning_style' do
        action.custom_action_learning_style = :on_the_job
        expect(action).to be_valid
      end
    end

    context 'when custom_action is nil' do
      let(:action) do
        build(:user_idp_development_action,
              user_idp_plan: user_idp_plan,
              user_idp_skill: user_idp_skill,
              development_action: development_action,
              custom_action: nil)
      end

      it 'does not require custom_action_learning_style' do
        expect(action).to be_valid
      end
    end
  end

  describe '#learning_style' do
    context 'with custom action' do
      let(:action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill,
               custom_action: 'Custom task',
               custom_action_learning_style: :on_the_job)
      end

      it 'returns the nil when custom action' do
        expect(action.learning_style).to be_nil
      end
    end

    context 'with development_action' do
      let(:development_action) { create(:development_action, learning_style: 'structured_learning') }
      let(:action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill,
               development_action: development_action,
               custom_action: nil)
      end

      it 'returns the development_action learning_style' do
        expect(action.learning_style).to eq('structured_learning')
      end
    end

    context 'with neither custom_action nor development_action' do
      let(:action) do
        create(:user_idp_development_action,
               user_idp_plan: user_idp_plan,
               user_idp_skill: user_idp_skill,
               development_action: nil,
               custom_action: nil)
      end

      it 'returns nil' do
        expect(action.learning_style).to be_nil
      end
    end
  end
end
