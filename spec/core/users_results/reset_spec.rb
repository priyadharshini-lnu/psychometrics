# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Reset do
  let(:test) { { 'test' => true } }
  let(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment, :with_report) }
  let(:report) { assessment.reports.first }
  let(:norm) { create(:norm) }
  let!(:users_result) do
    create(:users_result, subject: user,
      evaluator: user,
      assessment: assessment,
      campaign: campaign,
      answers: test,
      scoring: test,
      embedded_data: test,
      status: Assign.statuses[:completed],
      completed_at: Time.now,
      step: 100,
      occupations: test,
      expiry_date: Time.now,
      last_activity_at: Time.now,
      norm_id: norm.id)
  end
  let(:user_report) do
    create(:user_report, :with_pdf, report: report, user: user, campaign: campaign, status: :prepared)
  end
  let(:user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user, assessment: assessment, users_result: users_result)
  end
  let!(:media_response) { create(:media_response, users_result: users_result) }

  subject { described_class.call(user_assessment) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  it 'reset users_result data' do
    expect { subject }.to change { users_result.answers }.from(test).to({}).
      and change { users_result.scoring }.from(test).to(nil).
      and change { users_result.embedded_data }.from(test).to(nil).
      and change { users_result.norm_id }.from(norm.id).to(nil).
      and change { users_result.occupations }.from(test).to(nil).
      and change { users_result.status }.from('completed').to('not_started').
      and change { users_result.completed_at }.from(Time.now).to(nil).
      and change { users_result.step }.from(100).to(0).
      and change { users_result.expiry_date }.from(Time.now).to(nil).
      and change { users_result.last_activity_at }.from(Time.now).to(nil).
      and change { users_result.reset_count }.from(0).to(1)
  end

  it 'reset user_report data if assessment is completed' do
    expect { subject }.to(change { user_report.reload.pdf_identifier }.from('test.pdf').to(nil).
      and(change { user_report.status }.from('prepared').to('not_prepared')))
  end

  it 'dont reset user_report data if assessment is NOT completed' do
    allow(users_result).to receive(:completed?).and_return(false)
    expect { subject }.not_to(change { user_report.attributes })
  end

  it 'remove media response record associated with users_result' do
    expect { subject }.to change { MediaResponse.count }.by(-1)
    expect(MediaResponse.find_by(id: media_response.id)).to be_nil
  end
end
