# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Projects::IdpTemplatesController, swagger_doc: 'v2/swagger.json', type: :request do
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

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/projects/{project_id}/idp_templates' do
    get 'Idp Template list' do
      operationId 'IdpTemplateList'
      tags 'IdpTemplate'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Idp Template list' do
        run_test! do |response|
          idp_templates = JSON.parse(response.body)['data']
          expect(idp_templates[0]).to have_key('id')
          expect(idp_templates[0]).to have_attribute(:name).with_value(idp_template.name)
          expect(idp_templates[0]).to have_attribute(:description).with_value(idp_template.description)
        end
      end
    end

    post 'Create Idp Template' do
      operationId 'CreateIdpTemplate'
      description 'Create a new Idp Template'
      tags 'IdpTemplate'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/IdpTemplateCreateRequest' },
                required: true

      response '201', 'Idp Template Created' do
        schema '$ref' => '#/components/schemas/IdpTemplateResponse'

        let(:body) do
          {
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
                technical_client_skill_settings: 'none'
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
        end

        run_test! do |response|
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
        end
      end
    end

    path '/projects/{project_id}/idp_templates/{id}' do
      put 'Update Idp Template' do
        operationId 'UpdateIdpTemplate'
        description 'Update an existing Idp Template'
        tags 'IdpTemplate'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string
        parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/IdpTemplateUpdateRequest' },
                  required: true

        response '200', 'Idp Template Updated' do
          let(:id) { idp_template.id }
          let(:body) do
            {
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
          end

          run_test! do |response|
            idp_template.reload
            expect(response.status).to eq(200)
            expect(idp_template.name).to eq('Updated Template Name')
            expect(idp_template.description).to eq('Updated description')
          end
        end

        response '400', 'Update Not Allowed' do
          let!(:user_idp_plan) { create(:user_idp_plan, idp_template: idp_template) }
          let(:id) { idp_template.id }
          let(:body) do
            {
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
          end

          run_test! do |response|
            expect(response.status).to eq(400)
            json_response = JSON.parse(response.body)
            expect(json_response['error']).to eq(
              'Update not allowed because the IDP template is already associated with a user IDP plan. Appearance changes has been saved.' # rubocop:disable Layout/LineLength
            )
          end
        end
      end

      delete 'Delete Idp Template' do
        operationId 'DeleteIdpTemplate'
        description 'Delete an existing Idp Template'
        tags 'IdpTemplate'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string

        response '204', 'Idp Template Deleted' do
          let!(:idp_template_to_delete) { create(:idp_template, project: project) }
          let(:id) { idp_template_to_delete.id }

          run_test! do |response|
            expect(response.status).to eq(204)
            expect(IdpTemplate.find_by(id: id)).to be_nil
          end
        end

        response '400', 'Deletion Not Allowed' do
          let!(:user_idp_plan) { create(:user_idp_plan, idp_template: idp_template) }
          let(:id) { idp_template.id }

          run_test! do |response|
            expect(response.status).to eq(400)
            json_response = JSON.parse(response.body)
            expect(json_response['error']).to eq(
              'Deletion not allowed because the IDP template is already associated with a user IDP plan.'
            )
          end
        end
      end
    end
  end

  path '/projects/{project_id}/idp_templates/{id}/update_reflection_questions' do
    post 'Update Idp Template' do
      operationId 'UpdateIdpTemplateReflectionQuestions'
      description 'Update Idp Template reflection questions'
      tags 'IdpTemplate'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/IdpTemplateUpdateReflectionQuestionsRequest' },
                required: true

      response '200', 'Idp Template Updated' do
        let(:id) { idp_template.id }
        let(:body) do
          {
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
        end

        run_test! do |response|
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
    end
  end
end
