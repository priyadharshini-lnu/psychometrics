# frozen_string_literal: true

require 'rails_helper'

describe Idp::SaveUserIdpSkills do
  let!(:user) { create(:user) }
  let!(:skill) { create(:skill, name: 'abc', category: 'other') }
  let!(:skill2) { create(:skill, name: 'abc 2', category: 'other') }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template_skill) { create(:idp_template_skill, idp_template: idp_template, skill: skill) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }

  context 'when category is not present in form' do
    it 'saves selected idp skills' do
      skills_params = [{ 'skill_id' => skill.id }, { 'skill_id' => skill2.id }]
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: skills_params)

      res = described_class.call(user_idp_plan, skills_form)

      expect(res[:ok].count).to eq(2)
      expect(user_idp_plan.user_idp_skills.count).to eq(2)
    end

    it 'removes skills not included in the request' do
      create(:user_idp_skill, user_idp_plan: user_idp_plan)
      create(:user_idp_skill, user_idp_plan: user_idp_plan)

      new_skill = create(:skill)
      skills_params = [{ 'skill_id' => new_skill.id }]
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: skills_params)

      expect(user_idp_plan.user_idp_skills.count).to eq(2)

      res = described_class.call(user_idp_plan, skills_form)
      expect(user_idp_plan.user_idp_skills.count).to eq(1)
      expect(user_idp_plan.user_idp_skills.first.skill_id).to eq(new_skill.id)
      expect(res[:ok].first.skill_id).to eq(new_skill.id)
    end
  end

  context 'when category is present in form' do
    let(:technical_skill) { create(:skill, category: 'technical') }
    let(:other_skill) { create(:skill, category: 'other') }

    before do
      behavioral_skill = create(:skill, category: 'behavioral')
      behavioral_skill2 = create(:skill, category: 'behavioral')

      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: behavioral_skill)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: behavioral_skill2)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: technical_skill)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: other_skill)
    end

    it 'syncs skills for specified category' do
      category = 'behavioral'

      new_skill1 = create(:skill, category: category)
      new_skill2 = create(:skill, category: category)
      skills_params = { skills: [{ 'skill_id' => new_skill1.id }, { 'skill_id' => new_skill2.id }], category: category }
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills_params)

      res = described_class.call(user_idp_plan, skills_form)

      expect(res[:ok].count).to eq(2)
      expect(
        user_idp_plan.user_idp_skills.joins(:skill).
        where(skills: { category: category }).pluck(:skill_id)
      ).to include(new_skill1.id, new_skill2.id)
      expect(user_idp_plan.skills).to include(new_skill1, new_skill2)
      expect(user_idp_plan.skills).to include(technical_skill)
      expect(user_idp_plan.skills).to include(other_skill)
    end
  end
end
