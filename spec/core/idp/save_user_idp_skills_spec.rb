# frozen_string_literal: true

require 'rails_helper'

describe Idp::SaveUserIdpSkills do
  let!(:user) { create(:user) }
  let!(:skill) { create(:skill, name: 'abc', skill_type: 'other') }
  let!(:skill2) { create(:skill, name: 'abc 2', skill_type: 'other') }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template_skill) { create(:idp_template_skill, idp_template: idp_template, skill: skill) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }

  context 'when skill_type is not present in form' do
    it 'saves selected idp skills' do
      skills_params = [{ 'skill_id' => skill.id }, { 'skill_id' => skill2.id }]
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: skills_params)

      res = described_class.call(user_idp_plan, skills_form, user)

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

      res = described_class.call(user_idp_plan, skills_form, user)
      expect(user_idp_plan.user_idp_skills.count).to eq(1)
      expect(user_idp_plan.user_idp_skills.first.skill_id).to eq(new_skill.id)
      expect(res[:ok].first.skill_id).to eq(new_skill.id)
    end
  end

  context 'when skill_type is present in form' do
    let(:technical_skill) { create(:skill, skill_type: 'technical') }
    let(:other_skill) { create(:skill, skill_type: 'other') }

    before do
      behavioral_skill = create(:skill, skill_type: 'behavioral')
      behavioral_skill2 = create(:skill, skill_type: 'behavioral')

      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: behavioral_skill)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: behavioral_skill2)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: technical_skill)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: other_skill)
    end

    it 'syncs skills for specified skill_type' do
      skill_type = 'behavioral'

      new_skill1 = create(:skill, skill_type: skill_type)
      new_skill2 = create(:skill, skill_type: skill_type)
      skills_params = {
        skills: [{ 'skill_id' => new_skill1.id }, { 'skill_id' => new_skill2.id }], skill_type: skill_type
      }
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills_params)

      res = described_class.call(user_idp_plan, skills_form, user)

      expect(res[:ok].count).to eq(2)
      expect(
        user_idp_plan.user_idp_skills.joins(:skill).
        where(skills: { skill_type: skill_type }).pluck(:skill_id)
      ).to include(new_skill1.id, new_skill2.id)
      expect(user_idp_plan.skills).to include(new_skill1, new_skill2)
      expect(user_idp_plan.skills).to include(technical_skill)
      expect(user_idp_plan.skills).to include(other_skill)
    end
  end

  context 'when removing skills for pre-submission plan' do
    before do
      user_idp_plan.update!(approval_status: 'draft')
      create(:user_idp_skill, user_idp_plan: user_idp_plan)
      create(:user_idp_skill, user_idp_plan: user_idp_plan)
    end

    it 'hard deletes all skills not included in the request' do
      new_skill = create(:skill)
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: [
        { 'skill_id' => new_skill.id }
      ])

      expect(user_idp_plan.user_idp_skills.count).to eq(2)

      described_class.call(user_idp_plan, skills_form, user)

      expect(user_idp_plan.user_idp_skills.count).to eq(1)
      expect(user_idp_plan.user_idp_skills.first.skill_id).to eq(new_skill.id)
    end
  end

  context 'when removing skills after plan approval' do
    let!(:skill_in_approved_plan) { create(:skill, skill_type: 'other') }
    let!(:user_idp_skill_in_approved_plan) do
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill_in_approved_plan)
    end

    before do
      PaperTrail.request.enable_model(UserIdpPlan)
      user_idp_plan.update!(approval_status: 'approved')
      user_idp_plan.update!(approval_status: 'draft')
    end

    after do
      PaperTrail.request.disable_model(UserIdpPlan)
    end

    it 'soft deletes skills that were part of last approved version' do
      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: [])
      described_class.call(user_idp_plan, skills_form, user)

      expect(user_idp_plan.user_idp_skills.count).to eq(1)
      expect(
        user_idp_plan.user_idp_skills.where(deleted_at: nil).count
      ).to eq(0)
      expect(
        user_idp_skill_in_approved_plan.reload.deleted_at
      ).not_to be_nil
    end

    it 'hard deletes skills that were not part of last approved version' do
      new_skill_after_approval = create(:skill)
      create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: new_skill_after_approval)

      expect(user_idp_plan.user_idp_skills.count).to eq(2)

      skills_form = Idp::SaveUserIdpSkillsForm.new(skills: [{ 'skill_id' => skill_in_approved_plan.id }])
      described_class.call(user_idp_plan, skills_form, user)

      expect(user_idp_plan.user_idp_skills.count).to eq(1)
      expect(UserIdpSkill.find_by(skill_id: new_skill_after_approval.id)).to be_nil
    end
  end
end
