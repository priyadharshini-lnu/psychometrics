# frozen_string_literal: true

require 'rails_helper'

describe Idp::ToggleSkillPrivacy do
  let(:user) { create(:user) }
  let(:manager) { create(:user) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skill) { create(:skill) }
  let(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }

  describe '#call' do
    context 'when user toggles their own skill privacy' do
      it 'successfully toggles privacy from public to private' do
        expect(user_idp_skill.private).to be false

        result = described_class.call(user_idp_skill, user)

        expect(result[:ok]).to be_present
        expect(result[:ok][:skill].private).to be true
        expect(result[:ok][:message]).to include('marked as private')
      end

      it 'successfully toggles privacy from private to public' do
        user_idp_skill.update!(private: true)
        expect(user_idp_skill.private).to be true

        result = described_class.call(user_idp_skill, user)

        expect(result[:ok]).to be_present
        expect(result[:ok][:skill].private).to be false
        expect(result[:ok][:message]).to include('now visible')
      end
    end

    context 'when manager toggles skill privacy' do
      before do
        user.update!(manager: manager)
        allow_any_instance_of(UserIdpPlan).to receive(:manager_editable?).and_return(true)
        allow_any_instance_of(UserIdpPlan).to receive(:editable?).and_return(true)
      end

      it 'allows manager to toggle privacy' do
        result = described_class.call(user_idp_skill, manager)

        expect(result[:ok]).to be_present
        expect(result[:ok][:skill].private).to be true
      end
    end

    context 'when unauthorized user tries to toggle privacy' do
      let(:unauthorized_user) { create(:user) }

      it 'returns error' do
        result = described_class.call(user_idp_skill, unauthorized_user)

        expect(result[:error]).to eq('Unauthorized to modify this skill')
      end
    end

    context 'when skill is not found' do
      it 'returns error' do
        result = described_class.call(nil, user)

        expect(result[:error]).to eq('Skill not found')
      end
    end
  end
end
