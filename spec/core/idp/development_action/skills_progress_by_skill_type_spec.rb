# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SkillsProgressBySkillType do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:behavioral_skill) { create(:skill, skill_type: :behavioral) }
  let(:technical_skill) { create(:skill, skill_type: :technical) }
  let(:other_skill) { create(:skill, skill_type: :other) }

  let!(:user_idp_development_actions) do
    UserIdpDevelopmentAction.where(user_idp_plan: user_idp_plan).includes(:skill).all
  end

  subject(:skills_progress_by_skill_type) { described_class.new(user_idp_development_actions).call }

  context 'when there are development actions for all skill skill_type' do
    before do
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 10, skill: behavioral_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 40, skill: behavioral_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 90, skill: technical_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 73, skill: technical_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 16, skill: technical_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 100, skill: other_skill)
    end

    it 'returns the avarage progress of development actions grouped by skills skill_type' do
      expect(skills_progress_by_skill_type).to eq(
        behavioral: 25.0,
        technical: 59.67,
        other: 100.0
      )
    end
  end

  context 'when there are no development actions for a skill skill_type' do
    before do
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 10, skill: behavioral_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 40, skill: behavioral_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 90, skill: technical_skill)
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, progress: 73, skill: technical_skill)
    end

    it 'includes the skill_type with a count of 0' do
      expect(skills_progress_by_skill_type).to eq(
        behavioral: 25.0,
        technical: 81.5,
        other: 0.0
      )
    end
  end
end
