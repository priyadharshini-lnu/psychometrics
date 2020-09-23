# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::Remove do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:assessment) { create(:assessment, :with_report) }
  let(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: user)
  end

  let!(:user_report) do
    create(:user_report, report: assessment.reports.first, campaign: campaign, user: user)
  end

  let(:assessment1) { create(:assessment, :with_report) }

  let!(:user_report1) do
    create(:user_report, report: assessment1.reports.first, campaign: campaign, user: user)
  end

  it 'deletes user_assessment record' do
    described_class.call!(user_assessment, campaign)

    expect(UserAssessment.find_by(id: user_assessment.id)).to be_nil
  end

  it 'deletes user_report record' do
    described_class.call!(user_assessment, campaign)

    expect(UserReport.find_by(id: user_report.id)).to be_nil
  end

  it 'do not removes report associated with another assessment for same user' do
    described_class.call!(user_assessment, campaign)

    expect(UserReport.find_by(id: user_report1.id)).to eq(user_report1)
  end
end
