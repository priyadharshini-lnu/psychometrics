# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let!(:license) do
    create(:license, report_family: report_family, client: campaign.client, start_date: 2.days.ago,
      end_date: 2.days.since)
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'create' do
    it 'returns error if wrong params are passed' do
      put :create, params: {
        new_campaign_id: campaign.id,
        user_id: user.id,
        resource: { report_family_id: report_family.id, report_ids: [report.id], operation: 'wrong_operation' }
      }

      expect(response).to have_http_status(422)
    end

    it 'create and returns user_report and user_assessment' do
      put :create, params: {
        new_campaign_id: campaign.id,
        user_id: user.id,
        resource: {
          report_family_id: report_family.id,
          report_ids: [report.id],
          operation: 'add_with_existing_response'
        }
      }

      parsed_response = JSON.parse(response.body)
      check_report_response(parsed_response['user_reports'].first)
      check_assessment_response(parsed_response['user_assessments'].first)
    end
  end

  private

  def check_report_response(report_response)
    expect(report_response.keys).to eq(%w[id report_id name user_access report_family_name])
    expect(report_response).to include({
      'report_id' => report.id,
      'name' => report.name,
      'user_access' => false,
      'report_family_name' => report_family.name
    })
  end

  def check_assessment_response(assessment_response)
    expect(assessment_response.keys).to eq(%w[id assessment_id name category norm_name status norms norm_type norm_id])
    expect(assessment_response).to include({
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norm_type' => nil,
      'norms' => [],
      'status' => 'not_started'
    })
  end
end
