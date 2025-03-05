# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UserReportCommentsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:user_report) { create(:user_report) }
  let!(:user_report_id) { user_report.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/user_reports/{user_report_id}/user_report_comments/' do
    get 'UserReportComment List' do
      operationId 'UserReportCommentList'
      description 'Fetch UserReportComment List'

      tags 'UserReportComment'
      consumes 'application/json'
      security [basic: []]
      parameter name: :user_report_id, in: :path, type: :string

      response '200', 'UserReportComment list' do
        let(:admins) { create_list(:client_admin, 4) }
        let!(:user_report_comment) do
          create(:user_report_comment, :with_parent, user_report: user_report)
        end
        let!(:reply) { create(:user_report_comment, parent: user_report_comment) }
        let!(:other_user_report_comment) { create(:user_report_comment) }

        schema '$ref' => '#/components/schemas/UserReportCommentListResponse'

        examples 'application/json' => [{
          type: 'user_report_comments',
          data: {
            id: '770',
            attributes: {
              text: 'Hi'
            },
            relationships: {
              reports_module: {
                data: {
                  id: '1',
                  type: 'modules'
                }
              },
              parent: {
                data: {
                  id: '2',
                  type: 'user_report_comments'
                }
              },
              replies: {
                data: [{
                  id: '3',
                  type: 'user_report_comments'
                }]
              }
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          user_report_comments_response = data.find { |d| d['id'] == user_report_comment.id.to_s }
          expect(data.find { |d| d['id'] == other_user_report_comment.id.to_s }).to eq(nil)
          expect(user_report_comments_response).to have_key('id')
          expect(user_report_comments_response).to have_attribute(:text).with_value(user_report_comment.text)
          expect(user_report_comments_response).to have_attribute(:resolved).with_value(user_report_comment.resolved)
          expect(user_report_comments_response).to have_relationship(:reports_module).
            with_data({ 'id' => user_report_comment.reports_module_id.to_s, 'type' => 'modules' })
          expect(user_report_comments_response).to have_relationship(:parent).
            with_data({ 'id' => user_report_comment.parent_id.to_s, 'type' => 'user_report_comments' })
        end
      end
    end
  end

  path '/user_reports/{user_report_id}/user_report_comments/' do
    let(:report_module) { create(:module) }
    let(:parent) { create(:user_report_comment) }

    post 'Create a user_report_comments' do
      operationId 'CreateUserReportComment'
      description 'Create new UserReportComment'
      tags 'UserReportComment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_report_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserReportCommentCreateRequest' },
                required: true

      response '201', 'UserReportComment Created' do
        schema '$ref' => '#/components/schemas/UserReportCommentResponse'

        examples 'application/json' => [{
          type: 'user_report_comments',
          data: {
            id: '770',
            attributes: {
              text: 'Hi'
            },
            relationships: {
              reports_module: {
                data: {
                  id: '1',
                  type: 'modules'
                }
              },
              parent: {
                data: {
                  id: '2',
                  type: 'user_report_comments'
                }
              }
            }
          }
        }]

        let(:body) do
          jsonapi_resource_request(
            'user_report_comments',
            {
              text: 'Hi'
            },
            {
              reports_module: { id: report_module.id.to_s, type: 'modules' },
              parent: { id: parent.id.to_s, type: 'user_report_comments' }
            }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:text).with_value('Hi')
          expect(data).to have_relationship(:reports_module).
            with_data({ 'id' => report_module.id.to_s, 'type' => 'modules' })
          expect(data).to have_relationship(:parent).
            with_data({ 'id' => parent.id.to_s, 'type' => 'user_report_comments' })
        end
      end
    end
  end

  path '/user_reports/{user_report_id}/user_report_comments/{user_report_comment_id}' do
    let(:report_module) { create(:module) }
    let(:user_report_comment) do
      create(:user_report_comment, :with_parent, user_report: user_report, text: 'old text', creator: superadmin)
    end
    let(:user_report_comment_id) { user_report_comment.id }

    patch 'Update a user_report_comments' do
      operationId 'UpdateUserReportComment'
      description 'Update UserReportComment'
      tags 'UserReportComment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_report_comment_id, in: :path, type: :string
      parameter name: :user_report_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserReportCommentUpdateRequest' },
                required: true

      response '200', 'UserReportComment Updated' do
        schema '$ref' => '#/components/schemas/UserReportCommentResponse'

        examples 'application/json' => [{
          type: 'user_report_comments',
          data: {
            id: '770',
            attributes: {
              text: 'Hi'
            },
            relationships: {
              reports_module: {
                data: {
                  id: '1',
                  type: 'modules'
                }
              },
              parent: {
                data: {
                  id: '2',
                  type: 'user_report_comments'
                }
              }
            }
          }
        }]

        let(:body) do
          jsonapi_resource_request(
            'user_report_comments',
            { id: user_report_comment.id.to_s, text: 'modified text' },
            {}
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:text).with_value('modified text')
        end
      end
    end

    delete 'Delete a user_report_comment' do
      operationId 'DeleteUserReportComment'
      description 'Delete a UserReportComment'
      tags 'UserReportComment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_report_id, in: :path, type: :string
      parameter name: :user_report_comment_id, in: :path, type: :string

      response '204', 'UserReportComment Deleted' do
        run_test! do |response|
          ur = UserReportComment.find_by(id: user_report_comment_id)
          expect(response.body).to be_empty
          expect(ur.deleted_at).to_not eq(nil)
          expect(ur.deleted_by).to eq(superadmin)
        end
      end
    end
  end
end
