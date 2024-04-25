# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::AssignReportsAndAssessments::ParseImportData do
  let!(:campaign) { create(:campaign) }

  it '.call' do
    file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/report_and_assessments.csv'), 'text/csv')
    data = described_class.call!(file, campaign)

    expect(data).to eq([
      ['Email', 'Report Bundle Id', 'Report Id', 'Assessment Id', 'Norm Id'],
      {
        email: 'john@cc.com',
        report_bundle_id: '100',
        report_id: '200',
        assessment_id: '10',
        norm_id: '190'
      },
      {
        email: 'john@cc.com',
        report_bundle_id: '100',
        report_id: '201',
        assessment_id: '12',
        norm_id: '190'
      },
      {
        email: 'smith@cc.com',
        report_bundle_id: '101',
        report_id: '202',
        assessment_id: '10',
        norm_id: '192'
      }
    ])
  end
end
