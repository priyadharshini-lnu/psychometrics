# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SkillsByCategory do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:behavioral_skill) { create(:skill, category: :behavioral) }
  let(:technical_skill) { create(:skill, category: :technical) }
  let(:other_skill) { create(:skill, category: :other) }

  let(:user_idp_development_actions) do
    [
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: other_skill)
    ]
  end

  subject(:skills_by_category) { described_class.new(user_idp_development_actions).call }

  it 'returns the count of development actions grouped by skills category' do
    expect(skills_by_category).to eq(
      behavioral: 2,
      technical: 3,
      other: 1
    )
  end

  context 'when there are no development_actions for a skills category' do
    let(:user_idp_development_actions) do
      [
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill),
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill),
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill)
      ]
    end

    it 'includes the category with a count of 0' do
      expect(skills_by_category).to eq(
        behavioral: 2,
        technical: 1,
        other: 0
      )
    end
  end
end
