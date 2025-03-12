# frozen_string_literal: true

require 'rails_helper'

describe EndUser::SkillsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, active: true) }
  let(:project) { Project.find(user.project.id) } # Ensure we have a proper Project instance
  let!(:idp_template) { user_idp_plan.idp_template }
  let!(:skill) { create(:skill, name: 'abc', project: project) }
  let!(:skill2) { create(:skill, name: 'cde', project: project) }
  let!(:job_role) { create(:job_role, name: 'developer', skills: [skill, skill2]) }
  let!(:job_role2) { create(:job_role, name: 'manager', skills: [skill2]) }
  let!(:idp_template_skill) { create(:idp_template_skill, idp_template: idp_template, skill: skill) }
  let!(:idp_template_skill2) { create(:idp_template_skill, idp_template: idp_template, skill: skill2) }

  before(:each) do
    login_user(user)
    idp_template.update!(
      project: project,
      technical_client_skill_settings: 'all',
      behavioral_client_skill_settings: 'all',
      behavioral_global_skill_settings: 'all',
      technical_global_skill_settings: 'all'
    )
  end

  describe 'GET index' do
    context 'with filters' do
      it 'returns skills by search query' do
        get :index, params: { filters: { name_cont: 'ab', job_roles_id_eq: job_role.id } }

        parsed_response = response.parsed_body

        expect(response.status).to eq(200)
        expect(parsed_response.count).to eq(1)
        expect(parsed_response[0]['id']).to eq(skill.id)
        expect(parsed_response[0]['name']).to eq(skill.name)
      end

      it 'returns skills by search query' do
        get :index, params: { filters: { name_cont: 'c', job_roles_id_eq: job_role2.id } }

        parsed_response = response.parsed_body

        expect(response.status).to eq(200)
        expect(parsed_response.count).to eq(1)
        expect(parsed_response[0]['id']).to eq(skill2.id)
        expect(parsed_response[0]['name']).to eq(skill2.name)
      end

      it 'returns all skills' do
        get :index, params: { filters: { name_cont: 'c' } }

        parsed_response = response.parsed_body

        expect(response.status).to eq(200)
        expect(parsed_response.count).to eq(2)
      end
    end

    context 'without any filters' do
      let!(:technical_skill1) { create(:skill, name: 'Ruby', category: 'technical', project: project) }
      let!(:technical_skill2) { create(:skill, name: 'Python', category: 'technical', project: project) }
      let!(:technical_skill3) { create(:skill, name: 'JavaScript', category: 'technical', project: project) }

      let!(:behavioral_skill1) { create(:skill, name: 'Leadership', category: 'behavioral', project: project) }
      let!(:behavioral_skill2) { create(:skill, name: 'Communication', category: 'behavioral', project: project) }

      before do
        Skill.where(project: project).find_each do |skill|
          IdpTemplateSkill.find_or_create_by!(idp_template: idp_template, skill: skill)
        end
      end

      it 'returns sample skills from each category' do
        get :index

        parsed_response = response.parsed_body

        expect(response).to have_http_status(:ok)

        categories = parsed_response.map { |s| s['category'] }.uniq
        expect(categories).to match_array(%w[technical behavioral])

        technical_skills = parsed_response.select { |s| s['category'] == 'technical' }
        behavioral_skills = parsed_response.select { |s| s['category'] == 'behavioral' }

        expect(technical_skills).not_to be_empty
        expect(behavioral_skills).not_to be_empty

        expect(technical_skills.length).to be <= Skill::SAMPLES_PER_CATEGORY
        expect(behavioral_skills.length).to be <= Skill::SAMPLES_PER_CATEGORY
      end
    end
  end
end
