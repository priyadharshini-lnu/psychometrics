# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Projects::IdpTemplatesController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:project_id) { project.id }
  let(:client_id) { client.id }
  let!(:report) { create(:report) }
  let!(:superadmin) { create(:superadmin) }
  let!(:user) { create(:user) }
  let!(:user_id) { user.id }
  let!(:campaign) { create(:campaign) }
  let!(:skill1) { create(:skill, name: 'Skill 1') }
  let!(:skill2) { create(:skill, name: 'Skill 2') }
  let!(:idp_template) { create(:idp_template, project: project) }
  let!(:reflection_question) { create(:reflection_question, project_id: project.id) }
  let!(:interview_question) { create(:interview_question, project_id: project.id) }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end
  describe 'GET /projects/:project_id/idp_templates' do
    it 'fetches Idp Template list' do
      get "/api/v2/administration/projects/#{project_id}/idp_templates",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      idp_templates = JSON.parse(response.body)['data']
      expect(idp_templates[0]).to have_key('id')
      expect(idp_templates[0]).to have_attribute(:name).with_value(idp_template.name)
      expect(idp_templates[0]).to have_attribute(:description).with_value(idp_template.description)
    end
  end

  describe 'POST /projects/:project_id/idp_templates' do
    it 'creates Idp Template' do
      body = {
        data: {
          type: 'idp_templates',
          attributes: {
            name: 'Example Template Name',
            description: 'Example template description',
            self_rating_enabled: true,
            behavioural_global_tags: %w[tag1 tag2],
            behavioural_client_tags: %w[tag3 tag4],
            technical_global_tags: %w[tag5 tag6],
            technical_client_tags: %w[tag7 tag8],
            behavioral_global_skill_settings: 'selected',
            behavioral_client_skill_settings: 'none',
            technical_global_skill_settings: 'none',
            technical_client_skill_settings: 'none',
            translations: {
              en: {
                title_text: 'Example Template Title',
                subtitle_text: 'Example Template Subtitle'
              }
            }
          },
          relationships: {
            project: {
              data: {
                type: 'clients',
                id: project_id.to_s
              }
            },
            report: {
              data: {
                type: 'reports',
                id: report.id.to_s
              }
            },
            skills: {
              data: [
                {
                  type: 'skills',
                  id: skill1.id.to_s
                },
                {
                  type: 'skills',
                  id: skill2.id.to_s
                }
              ]
            }
          }
        },
        include: 'skills'
      }

      post "/api/v2/administration/projects/#{project_id}/idp_templates",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(201)
      idp_template_response = JSON.parse(response.body)['data']
      expect(idp_template_response).to have_key('id')
      expect(idp_template_response).to have_attribute(:name).with_value('Example Template Name')
      expect(idp_template_response['relationships']['project']['data']['id']).to eq(project_id.to_s)
      expect(idp_template_response['relationships']['report']['data']['id']).to eq(report.id.to_s)
      expect(idp_template_response['relationships']).to have_key('skills')

      expect(idp_template_response['relationships']['skills']['data']).to match_array([
        { 'type' => 'skills', 'id' => skill1.id.to_s },
        { 'type' => 'skills', 'id' => skill2.id.to_s }
      ])
      expect(idp_template_response).to have_attribute(:behavioral_global_skill_settings).with_value('selected')
      expect(idp_template_response).to have_attribute(:behavioral_client_skill_settings).with_value('none')
      expect(idp_template_response).to have_attribute(:technical_global_skill_settings).with_value('none')
      expect(idp_template_response).to have_attribute(:technical_client_skill_settings).with_value('none')
      expect(idp_template_response).to have_attribute(:translations).with_value(
        {
          'en' => {
            'title_text' => 'Example Template Title',
            'subtitle_text' => 'Example Template Subtitle'
          }
        }
      )
    end
  end

  describe 'PUT /projects/:project_id/idp_templates/:id' do
    it 'updates Idp Template' do
      body = {
        data: {
          type: 'idp_templates',
          id: idp_template.id.to_s,
          attributes: {
            name: 'Updated Template Name',
            description: 'Updated description'
          },
          relationships: {
            project: {
              data: {
                type: 'clients',
                id: project_id.to_s
              }
            }
          }
        }
      }

      put "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template.id}",
          params: body.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      idp_template.reload
      expect(response.status).to eq(200)
      expect(idp_template.name).to eq('Updated Template Name')
      expect(idp_template.description).to eq('Updated description')
    end

    it 'does not allow update when IDP template is associated with user IDP plan' do
      create(:user_idp_plan, idp_template: idp_template)
      body = {
        data: {
          type: 'idp_templates',
          id: idp_template.id.to_s,
          attributes: {
            name: 'Attempted Update Name'
          },
          relationships: {
            project: {
              data: {
                type: 'clients',
                id: project_id.to_s
              }
            }
          }
        }
      }

      put "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template.id}",
          params: body.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(400)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq(
        'Update not allowed because the IDP template is already associated with a user IDP plan.'
      )
    end
  end

  describe 'DELETE /projects/:project_id/idp_templates/:id' do
    it 'deletes Idp Template' do
      idp_template_to_delete = create(:idp_template, project: project)

      delete "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template_to_delete.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(204)
      expect(IdpTemplate.find_by(id: idp_template_to_delete.id)).to be_nil
    end

    it 'does not allow deletion when IDP template is associated with user IDP plan' do
      create(:user_idp_plan, idp_template: idp_template)

      delete "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(400)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq(
        'Deletion not allowed because the IDP template is already associated with a user IDP plan.'
      )
    end
  end

  describe 'POST /projects/:project_id/idp_templates/:id/update_reflection_questions' do
    it 'updates Idp Template reflection questions' do
      reflection_question = create(:reflection_question, project_id: project.id)
      body = {
        data: {
          attributes: {
            reflection_questions: [
              id: reflection_question.id.to_s,
              mandatory: true,
              min_words: 3,
              max_words: 10
            ]
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template.id}/update_reflection_questions",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      idp_template.reload
      expect(response.status).to eq(200)
      expect(idp_template.reflection_questions.count).to eq(1)
      rq = idp_template.reflection_questions.first
      itrq = idp_template.idp_template_reflection_questions.first
      expect(rq.mandatory).to eq(false)
      expect(rq.min_words).to eq(nil)
      expect(rq.max_words).to eq(nil)
      expect(itrq.mandatory).to eq(true)
      expect(itrq.min_words).to eq(3)
      expect(itrq.max_words).to eq(10)
    end
  end

  describe 'POST /projects/:project_id/idp_templates/:id/update_interview_questions' do
    it 'updates Idp Template interview questions' do
      interview_question = create(:interview_question, project_id: project.id)
      body = {
        data: {
          attributes: {
            interview_questions: [
              id: interview_question.id.to_s,
              mandatory: false,
              time_limit: 30
            ]
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/idp_templates/#{idp_template.id}/update_interview_questions",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      idp_template.reload
      expect(response.status).to eq(200)
      expect(idp_template.interview_questions.count).to eq(1)
      rq = idp_template.interview_questions.first
      itrq = idp_template.idp_template_interview_questions.first
      expect(rq.mandatory).to eq(true)
      expect(rq.time_limit).to eq(180)
      expect(itrq.mandatory).to eq(false)
      expect(itrq.time_limit).to eq(30)
    end
  end
end
