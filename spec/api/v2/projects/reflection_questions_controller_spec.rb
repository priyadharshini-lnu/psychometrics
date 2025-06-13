# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Projects::ReflectionQuestionsController, swagger_doc: 'v2/swagger.json',
type: :request do
  let!(:project) { create(:project) }
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  let!(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:project_id) { project.id }
  let!(:idp_template) { create(:idp_template, project_id: project.id) }
  let!(:reflection_question) { create(:reflection_question, project_id: project.id, question: 'test question') }
  let!(:reflection_question2) { create(:reflection_question, project_id: project.id, question: 'test question2') }
  let!(:idp_template_reflection_questions) do
    reflection_question2.idp_template_reflection_questions.create(idp_template_id: idp_template.id)
  end
  before { sign_in(superadmin) }

  path '/projects/{project_id}/reflection_questions' do
    get 'Get a reflection questions' do
      operationId 'GetReflectionQuestions'
      description 'Get Reflection Questions'
      tags 'ReflectionQuestions'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :'filter[project_id_eq]', in: :query, required: true

      response '200', 'IdpSetting Update' do
        schema '$ref' => '#/components/schemas/ReflectionQuestionsListResponse'
        let!(:'filter[project_id_eq]') { project_id }

        run_test! do |response|
          data = JSON.parse(response.body)['data'].first
          expect(data).to have_key('id')
          expect(data).to have_attribute(:question).with_value('test question')
        end
      end
    end

    post 'Create a reflection questions' do
      operationId 'CreateReflectionQuestions'
      description 'Create Reflection Questions'
      tags 'ReflectionQuestions'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReflectionQuestionCreateRequest' },
                required: true

      response '201', 'Reflection Questions Created' do
        schema '$ref' => '#/components/schemas/ReflectionQuestionResponse'

        examples 'application/json' => [{
          type: 'reflection_questions',
          data: {
            attributes: {
              question: 'test question',
              mandatory: true,
              min_words: 0,
              max_words: 100
            },
            relationships: {
              project: {
                data: {
                  id: '123',
                  type: 'clients'
                }
              }
            }
          }
        }]
        let(:body) do
          jsonapi_resource_request(
            'reflection_questions',
            {
              question: 'test question',
              mandatory: true,
              min_words: 0,
              max_words: 100
            },
            { project: { id: project.id.to_s, type: 'clients' } }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:question).with_value('test question')
          expect(data).to have_attribute(:mandatory).with_value(true)
          expect(data).to have_attribute(:min_words).with_value(0)
          expect(data).to have_attribute(:max_words).with_value(100)
          expect(data).to have_attribute(:allow_delete).with_value(true)
        end
      end

      response '422', 'Unprocessable Entity' do
        let(:body) do
          jsonapi_resource_request(
            'reflection_questions',
            {
              question: ''
            }
          )
        end

        run_test! do |response|
          errors = JSON.parse(response.body)['errors']
          expect(errors).to include({
            'title' => "can't be blank",
            'status' => '422',
            'source' => { 'pointer' => '/data/attributes/question' }
          })
          expect(errors).to include({
            'title' => "can't be blank",
            'status' => '422',
            'source' => { 'pointer' => '/data/relationships' }
          })
        end
      end
    end

    path '/projects/{project_id}/reflection_questions/{id}' do
      put 'Update a reflection questions' do
        operationId 'UpdateReflectionQuestions'
        description 'Update Reflection Questions'
        tags 'ReflectionQuestions'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string
        parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReflectionQuestionUpdateRequest' },
                  required: true

        response '200', 'Reflection Questions Updated' do
          schema '$ref' => '#/components/schemas/ReflectionQuestionResponse'

          examples 'application/json' => [{
            type: 'reflection_questions',
            data: {
              id: '',
              attributes: {
                question: 'test question',
                mandatory: true,
                min_words: 0,
                max_words: 100
              },
              relationships: {
                project: {
                  data: {
                    id: '123',
                    type: 'clients'
                  }
                }
              }
            }
          }]
          let(:id) { reflection_question.id.to_s }
          let(:body) do
            jsonapi_resource_request(
              'reflection_questions',
              {
                id: reflection_question.id.to_s,
                question: 'updated question content',
                mandatory: true,
                min_words: 20,
                max_words: 50
              },
              {
                project: {
                  id: project.id.to_s,
                  type: 'clients'
                }
              }
            )
          end

          run_test! do |response|
            data = JSON.parse(response.body)['data']
            expect(data).to have_key('id')
            expect(data).to have_attribute(:question).with_value('updated question content')
            expect(data).to have_attribute(:mandatory).with_value(true)
            expect(data).to have_attribute(:min_words).with_value(20)
            expect(data).to have_attribute(:max_words).with_value(50)
            expect(reflection_question.reload.question).to eq('updated question content')
            expect(reflection_question.reload.mandatory).to eq(true)
            expect(reflection_question.reload.min_words).to eq(20)
            expect(reflection_question.reload.max_words).to eq(50)
          end
        end

        response '422', 'Unprocessable Entity' do
          let(:id) { reflection_question.id.to_s }
          let(:body) do
            jsonapi_resource_request(
              'reflection_questions',
              {
                id: reflection_question.id.to_s,
                question: ''
              },
              {
                project: {
                  id: project.id.to_s,
                  type: 'clients'
                }
              }
            )
          end

          run_test! do |response|
            errors = JSON.parse(response.body)['errors']
            expect(errors).to include({
              'title' => "can't be blank",
              'status' => '422',
              'source' => { 'pointer' => '/data/attributes/question' }
            })
          end
        end
      end

      delete 'Delete Idp Template' do
        operationId 'DeleteReflectionQuestions'
        description 'Delete Reflection Questions'
        tags 'ReflectionQuestions'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string

        response '204', 'Reflection Question Deleted' do
          let(:id) { reflection_question.id.to_s }

          run_test! do |response|
            expect(response.status).to eq(204)
            expect(ReflectionQuestion.find_by(id: id)).to be_nil
          end
        end

        response '422', 'Unprocessable Entity' do
          let(:id) { reflection_question2.id.to_s }

          run_test! do |response|
            errors = JSON.parse(response.body)['errors']
            expect(errors).to include({
              'title' => "This record can't be deleted",
              'status' => '422',
              'source' => { 'pointer' => '/id' }
            })
          end
        end
      end
    end
  end

  path '/projects/{project_id}/reflection_questions/export' do
    post 'Export reflection questions' do
      operationId 'ExportReflectionQuestions'
      description 'Export reflection questions for a project'
      tags 'ReflectionQuestions'
      consumes 'multipart/form-data'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Queues export_reflection_questions job successfully' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('export_reflection_questions')
        end
      end
    end
  end

  path '/projects/{project_id}/reflection_questions/import' do
    post 'Import reflection questions' do
      operationId 'ImportReflectionQuestions'
      description 'Import reflection questions for a project'
      tags 'ReflectionQuestions'
      consumes 'multipart/form-data'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :file, in: :formData, type: :file, description: 'CSV file'

      let(:file) do
        Rack::Test::UploadedFile.new(
          Rails.public_path.join('example_csv/import_reflection_questions_sample.csv'), 'text/csv'
        )
      end

      response '200', 'Queues import_reflection_questions job' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('import_reflection_questions')
        end
      end
    end
  end
end
