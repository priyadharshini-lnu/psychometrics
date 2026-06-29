# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UserReportCommentsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:user_report) { create(:user_report) }
  let!(:user_report_id) { user_report.id }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/user_reports/:user_report_id/user_report_comments' do
    it 'fetches UserReportComment List' do
      create_list(:client_admin, 4)
      user_report_comment = create(:user_report_comment, :with_parent, user_report: user_report)
      create(:user_report_comment, parent: user_report_comment)
      other_user_report_comment = create(:user_report_comment)

      get "/api/v2/administration/user_reports/#{user_report_id}/user_report_comments",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /api/v2/administration/user_reports/:user_report_id/user_report_comments' do
    it 'creates user_report_comments' do
      report_module = create(:module)
      parent = create(:user_report_comment)

      body = jsonapi_resource_request(
        'user_report_comments',
        {
          text: 'Hi'
        },
        {
          reports_module: { id: report_module.id.to_s, type: 'modules' },
          parent: { id: parent.id.to_s, type: 'user_report_comments' }
        }
      )

      post "/api/v2/administration/user_reports/#{user_report_id}/user_report_comments",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:text).with_value('Hi')
      expect(data).to have_relationship(:reports_module).
        with_data({ 'id' => report_module.id.to_s, 'type' => 'modules' })
      expect(data).to have_relationship(:parent).
        with_data({ 'id' => parent.id.to_s, 'type' => 'user_report_comments' })
    end
  end

  describe 'PATCH /api/v2/administration/user_reports/:user_report_id/user_report_comments/:user_report_comment_id' do
    it 'updates user_report_comments' do
      user_report_comment = create(:user_report_comment, :with_parent, user_report: user_report, text: 'old text',
creator: superadmin)

      body = jsonapi_resource_request(
        'user_report_comments',
        { id: user_report_comment.id.to_s, text: 'modified text' },
        {}
      )

      patch "/api/v2/administration/user_reports/#{user_report_id}/user_report_comments/#{user_report_comment.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:text).with_value('modified text')
    end
  end

  describe 'DELETE /api/v2/administration/user_reports/:user_report_id/user_report_comments/:user_report_comment_id' do
    it 'deletes user_report_comment' do
      user_report_comment = create(:user_report_comment, :with_parent, user_report: user_report, text: 'old text',
creator: superadmin)

      delete "/api/v2/administration/user_reports/#{user_report_id}/user_report_comments/#{user_report_comment.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      ur = UserReportComment.find_by(id: user_report_comment.id)
      expect(response.body).to be_empty
      expect(ur.deleted_at).to_not eq(nil)
      expect(ur.deleted_by).to eq(superadmin)
    end
  end
end
