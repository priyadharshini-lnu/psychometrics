# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idp::IdpPlan::AvailableSkillsQuery do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:user) { create(:user, project: project) }
  let(:idp_template) { create(:idp_template, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign:, user:) }
  let!(:user_idp_plan) { create(:user_idp_plan, idp_template: idp_template, campaign:, user:) }

  let(:current_job_role) { create(:job_role, project: project) }
  let(:target_job_role) { create(:job_role, project: project) }

  let!(:technical_skill) { create(:skill, project: Project.find(project.id), skill_type: 'technical') }
  let!(:behavioral_skill) { create(:skill, project: Project.find(project.id), skill_type: 'behavioral') }
  let!(:leadership_skill) { create(:skill, project: Project.find(project.id), skill_type: 'behavioral') }
  let!(:template_skill) { create(:skill, project: Project.find(project.id), skill_type: 'technical') }

  before do
    create(:skills_job_role, job_role: current_job_role, skill: technical_skill)
    create(:skills_job_role, job_role: current_job_role, skill: behavioral_skill)
    create(:skills_job_role, job_role: target_job_role, skill: leadership_skill)
    idp_template.technical_client_skill_settings = 'selected'
    idp_template.skills << template_skill
  end

  describe '.call' do
    context 'when both job roles are present' do
      before do
        campaign_user.update!(current_job_role: current_job_role, target_job_role: target_job_role)
      end

      it 'returns only job role skills union' do
        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(technical_skill.id, behavioral_skill.id, leadership_skill.id)
        expect(skill_ids).not_to include(template_skill.id)
      end

      it 'excludes skills already in the plan' do
        create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: technical_skill)

        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(behavioral_skill.id, leadership_skill.id)
        expect(skill_ids).not_to include(technical_skill.id)
      end
    end

    context 'when only current job role is present' do
      before do
        campaign_user.update!(current_job_role: current_job_role, target_job_role: nil)
      end

      it 'returns job role skills merged with template skills' do
        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(technical_skill.id, behavioral_skill.id, template_skill.id)
      end
    end

    context 'when no job roles are present' do
      before do
        campaign_user.update!(current_job_role: nil, target_job_role: nil)
      end

      it 'returns only template available skills' do
        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(template_skill.id)
      end
    end

    context 'when job roles share the same skill' do
      before do
        campaign_user.update!(current_job_role: current_job_role, target_job_role: target_job_role)
        create(:skills_job_role, job_role: target_job_role, skill: technical_skill)
      end

      it 'returns unique skills without duplicates' do
        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(technical_skill.id, behavioral_skill.id, leadership_skill.id)
      end
    end

    context 'when template and job role have same skill' do
      before do
        idp_template.skills << technical_skill
        campaign_user.update!(current_job_role: current_job_role, target_job_role: nil)
      end

      it 'returns unique skills without duplicates' do
        skills = described_class.new(user_idp_plan).query
        skill_ids = skills.pluck(:id)

        expect(skill_ids).to contain_exactly(technical_skill.id, behavioral_skill.id, template_skill.id)
      end
    end

    context 'when no skills are available anywhere' do
      before do
        SkillsJobRole.destroy_all
        idp_template.skills.clear
        campaign_user.update!(current_job_role: nil, target_job_role: nil)
      end

      it 'returns empty relation' do
        result = described_class.new(user_idp_plan).query

        expect(result).to be_empty
      end
    end
  end
end
