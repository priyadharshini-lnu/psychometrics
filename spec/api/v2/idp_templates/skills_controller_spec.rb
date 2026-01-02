# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::IdpTemplates::SkillsController, type: :controller do
  let(:superadmin) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:idp_template) do
    create(
      :idp_template,
      project_id: project.id,
      technical_client_skill_settings: 'all',
      behavioral_client_skill_settings: 'all',
      behavioral_global_skill_settings: 'all',
      technical_global_skill_settings: 'all'
    )
  end
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:plan) { create(:user_idp_plan, idp_template: idp_template, campaign: campaign, user: user) }
  let!(:skills) { create_list(:skill, 5, project_id: idp_template.project_id) }
  let!(:other_skills) { create_list(:skill, 3) }

  describe 'GET #index' do
    before do
      sign_in(superadmin)
    end

    it 'returns skills filtered by available_skills_by_plan_id' do
      get :index, params: { filter: { available_skills_by_plan_id: plan.id, project_id_eq: idp_template.project_id } }
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(5)
    end

    it 'doesnt return skills which are not related to the plan_id' do
      get :index, params: { filter: { available_skills_by_plan_id: plan.id, project_id_eq: idp_template.project_id } }
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      returned_skill_ids = json_response['data'].map { |s| s['id'].to_i }
      other_skills.each do |skill|
        expect(returned_skill_ids).not_to include(skill.id)
      end
    end

    it 'returns skills filtered by name_cont' do
      skill_to_search = skills.first
      get :index, params: {
        filter: {
          name_cont: skill_to_search.name,
          available_skills_by_plan_id: plan.id,
          project_id_eq: idp_template.project_id
        }
      }
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['id'].to_i).to eq(skill_to_search.id)
    end

    it 'returns skills filtered by filter_by_skill_type' do
      skill_to_search = skills.first
      get :index, params: {
        filter: {
          filter_by_skill_type: skill_to_search.skill_type,
          available_skills_by_plan_id: plan.id,
          project_id_eq: idp_template.project_id
        }
      }
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to be >= 1
      expect(json_response['data'].map { |s| s['attributes']['skill_type'] }).to all(eq(skill_to_search.skill_type))
    end
  end
end
