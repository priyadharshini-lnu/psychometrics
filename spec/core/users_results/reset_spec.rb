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
    users_result = create(:users_result, subject: user,
      evaluator: user,
      assessment: assessment,
      campaign: campaign,
      answers: test,
      scoring: test,
      embedded_data: test,
      step: 100,
      occupations: test)
    users_result.user_assessment.update!(
      completed_at: Time.zone.now, norm_id: norm.id, status: :completed, expiry_date: Time.zone.now,
      last_activity_at: Time.zone.now
    )
    users_result
  end
  let!(:user_report) do
    create(:user_report, :with_pdf, report: report, user: user, campaign: campaign, status: :prepared)
  end
  let(:user_assessment) do
    users_result.user_assessment
    # create(:user_assessment, campaign: campaign, subject: user, assessment: assessment, users_result: users_result)
  end
  let!(:media_response) { create(:media_response, users_result: users_result) }

  subject { described_class.call(user_assessment) }

  it '.call!' do
    expect(described_class).to respond_to(:call!).with_unlimited_arguments
  end

  it "doesn't call Iiht::UpdateAttempts for iiht assessment if number of allowed attempts is not surpassed" do
    schedule_id = 123
    allow(user_assessment).to receive(:iiht?).and_return(true)
    allow(user_assessment).to receive_message_chain(:iiht_user_assessment, :schedule_id).and_return(schedule_id)
    allow(Iiht::GetScores).to receive(:call!).and_return({
      'schedules' => [{
        'scheduleId' => schedule_id,
        'availedAttempts' => 2,
        'maxAttempts' => 3
      }]
    })
    expect(Iiht::UpdateAttempts).to_not receive(:call!)

    subject
  end

  it 'calls Iiht::UpdateAttempts for iiht assessment if number of allowed attempts is surpassed' do
    schedule_id = 123
    allow(user_assessment).to receive(:iiht?).and_return(true)
    allow(user_assessment).to receive_message_chain(:iiht_user_assessment, :schedule_id).and_return(schedule_id)
    allow(Iiht::GetScores).to receive(:call!).and_return({
      'schedules' => [{
        'scheduleId' => schedule_id,
        'availedAttempts' => 3,
        'maxAttempts' => 3
      }]
    })
    expect(Iiht::UpdateAttempts).to receive(:call!).with(user_assessment)

    expect(subject[:error]).to eq(nil)
    expect(user_assessment.not_started?).to eq(true)
  end

  it 'calls Saville::ResetAssessment is it is a saville assessment' do
    allow(user_assessment.assessment).to receive(:saville?).and_return(true)
    expect(Saville::ResetAssessment).to receive(:call!).with(user_assessment)

    subject
  end

  it 'calls Mettl::ResetCandidateAssessment is it is a mettl assessment' do
    allow(user_assessment.assessment).to receive(:mettl?).and_return(true)
    expect(Mettl::ResetCandidateAssessment).to receive(:call!).with(user_assessment)

    subject
  end

  it 'calls Mettl::ResetCandidateAssessment is it is a mettl assessment and not reached max reset count' do
    allow(user_assessment.assessment).to receive(:mettl?).and_return(true)
    expect(Mettl::ResetCandidateAssessment).to receive(:call!).with(user_assessment)

    subject

    user_assessment.update!(reset_count: 3)
    expect(Mettl::ResetCandidateAssessment).not_to receive(:call!).with(user_assessment)

    subject
  end

  it 'reset users_result data' do
    expect { subject }.to change { users_result.answers }.from(test).to({}).
      and change { users_result.scoring }.from(test).to(nil).
      and change { users_result.embedded_data }.from(test).to(nil).
      and change { user_assessment.norm_id }.from(norm.id).to(nil).
      and change { users_result.occupations }.from(test).to(nil).
      and change { user_assessment.status }.from('completed').to('not_started').
      and change { user_assessment.completed_at }.from(Time.zone.now).to(nil).
      and change { users_result.step }.from(100).to(0).
      and change { user_assessment.expiry_date }.from(Time.zone.now).to(nil).
      and change { user_assessment.last_activity_at }.from(Time.zone.now).to(nil).
      and change { user_assessment.reset_count }.from(0).to(1)
  end

  it 'reset user_report data if assessment is completed' do
    allow(user_assessment).to receive(:completed?).and_return(true)
    subject
    expect(user_report.reload.pdf_file.attached?).to be_falsey
    expect(user_report.reload.status).to eq('not_prepared')
  end

  it 'dont reset user_report data if assessment is NOT completed' do
    allow(user_assessment).to receive(:completed?).and_return(true)
    expect { subject }.not_to(change { user_report.attributes })
  end

  it 'remove media response record associated with users_result' do
    expect { subject }.to change { MediaResponse.count }.by(-1)
    expect(MediaResponse.find_by(id: media_response.id)).to be_nil
  end
end
