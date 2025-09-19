# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Projects::InterviewQuestionsController, swagger_doc: 'v2/swagger.json',
type: :request do
  let!(:project) { create(:project) }
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  let!(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:project_id) { project.id }
  let!(:idp_template) { create(:idp_template, project_id: project.id) }
  let!(:interview_question) { create(:interview_question, project_id: project.id, question: 'test question') }
  let!(:interview_question2) { create(:interview_question, project_id: project.id, question: 'test question2') }
  let!(:idp_template_interview_questions) do
    interview_question2.idp_template_interview_questions.create(idp_template_id: idp_template.id)
  end
  before { sign_in(superadmin) }

  path '/projects/{project_id}/interview_questions' do
    get 'Get a interview questions' do
      operationId 'GetInterviewQuestions'
      description 'Get Interview Questions'
      tags 'InterviewQuestions'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :'filter[project_id_eq]', in: :query, required: true

      response '200', 'IdpSetting Update' do
        schema '$ref' => '#/components/schemas/InterviewQuestionsListResponse'
        let!(:'filter[project_id_eq]') { project_id }

        run_test! do |response|
          data = JSON.parse(response.body)['data'].first
          expect(data).to have_key('id')
          expect(data).to have_attribute(:question).with_value('test question')
        end
      end
    end

    post 'Create a interview questions' do
      operationId 'CreateInterviewQuestions'
      description 'Create Interview Questions'
      tags 'InterviewQuestions'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/InterviewQuestionCreateRequest' },
                required: true

      response '201', 'Interview Questions Created' do
        schema '$ref' => '#/components/schemas/InterviewQuestionResponse'

        examples 'application/json' => [{
          type: 'interview_questions',
          data: {
            attributes: {
              question: 'test question',
              description: 'test description',
              mandatory: true,
              time_limit: 180,
              question_type: 'audio'
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
            'interview_questions',
            {
              question: 'test question',
              description: 'test description',
              mandatory: true,
              time_limit: 180,
              question_type: 'audio'
            },
            { project: { id: project.id.to_s, type: 'clients' } }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:question).with_value('test question')
          expect(data).to have_attribute(:description).with_value('test description')
          expect(data).to have_attribute(:mandatory).with_value(true)
          expect(data).to have_attribute(:time_limit).with_value(180)
          expect(data).to have_attribute(:allow_delete).with_value(true)
        end
      end

      response '422', 'Unprocessable Entity' do
        let(:body) do
          jsonapi_resource_request(
            'interview_questions',
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

    path '/projects/{project_id}/interview_questions/{id}' do
      put 'Update a interview questions' do
        operationId 'UpdateInterviewQuestions'
        description 'Update Interview Questions'
        tags 'InterviewQuestions'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string
        parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/InterviewQuestionUpdateRequest' },
                  required: true

        response '200', 'Interview Questions Updated' do
          schema '$ref' => '#/components/schemas/InterviewQuestionResponse'

          examples 'application/json' => [{
            type: 'interview_questions',
            data: {
              id: '',
              attributes: {
                question: 'test question',
                description: 'test description',
                mandatory: true,
                time_limit: 180,
                question_type: 'audio'
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
          let(:id) { interview_question.id.to_s }
          let(:body) do
            jsonapi_resource_request(
              'interview_questions',
              {
                id: interview_question.id.to_s,
                question: 'updated question content',
                description: 'test description',
                mandatory: true,
                time_limit: 90,
                question_type: 'audio'
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
            expect(data).to have_attribute(:time_limit).with_value(90)
            expect(interview_question.reload.question).to eq('updated question content')
            expect(interview_question.reload.mandatory).to eq(true)
            expect(interview_question.reload.time_limit).to eq(90)
          end
        end

        response '422', 'Unprocessable Entity' do
          let(:id) { interview_question.id.to_s }
          let(:body) do
            jsonapi_resource_request(
              'interview_questions',
              {
                id: interview_question.id.to_s,
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
        operationId 'DeleteInterviewQuestions'
        description 'Delete Interview Questions'
        tags 'InterviewQuestions'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :project_id, in: :path, type: :string
        parameter name: :id, in: :path, type: :string

        response '204', 'Interview Question Deleted' do
          let(:id) { interview_question.id.to_s }

          run_test! do |response|
            expect(response.status).to eq(204)
            expect(InterviewQuestion.find_by(id: id)).to be_nil
          end
        end

        response '422', 'Unprocessable Entity' do
          let(:id) { interview_question2.id.to_s }

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

  path '/projects/{project_id}/interview_questions/export' do
    post 'Export interview questions' do
      operationId 'ExportInterviewQuestions'
      description 'Export interview questions for a project'
      tags 'InterviewQuestions'
      consumes 'multipart/form-data'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Queues export_interview_questions job successfully' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('export_interview_questions')
        end
      end
    end
  end

  path '/projects/{project_id}/interview_questions/import' do
    post 'Import interview questions' do
      operationId 'ImportInterviewQuestions'
      description 'Import interview questions for a project'
      tags 'InterviewQuestions'
      consumes 'multipart/form-data'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :file, in: :formData, type: :file, description: 'CSV file'

      let(:file) do
        Rack::Test::UploadedFile.new(
          Rails.public_path.join('example_csv/import_interview_questions_sample.csv'), 'text/csv'
        )
      end

      response '200', 'Queues import_interview_questions job' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('import_interview_questions')
        end
      end
    end
  end
end
