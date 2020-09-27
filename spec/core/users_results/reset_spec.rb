# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Reset do
  let(:test) { { 'test' => true } }
  let(:user) { create(:user) }
  let(:user1) { create(:user) }
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
      norm_type: 'ETI',
      norm_id: norm.id)
  end
  let(:user_report) do
    create(:user_report, :with_pdf, report: report, user: user, campaign: campaign, status: :prepared)
  end
  let(:user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user, assessment: assessment, users_result: users_result)
  end
  let!(:media_response) { create(:media_response, users_result: users_result) }
  let!(:multiple_assessment_user_result) do
    create(:users_result, status: :in_progress, subject: user1, assessment: assessment, campaign: campaign)
  end
  let!(:media_response1) { create(:media_response, users_result: multiple_assessment_user_result) }
  let!(:user_assessments) do
    create_list(:user_assessment, 2, subject: user1, assessment: assessment,
      users_result: multiple_assessment_user_result)
  end
  let!(:user_report1) do
    create(:user_report, :with_pdf, report: report, user: user1, campaign: campaign, status: :prepared)
  end

  context 'for user result associated with single assessment' do
    subject { described_class.call(user_assessment) }

    it '.call!' do
      expect(described_class).to respond_to(:'call!').with_unlimited_arguments
    end

    it 'doesnt creates new user_result record' do
      expect { subject }.to change { UsersResult.count }.by(0)
    end

    it 'reset users_result data' do
      expect { subject }.to change { users_result.answers }.from(test).to({}).
        and change { users_result.scoring }.from(test).to(nil).
        and change { users_result.embedded_data }.from(test).to(nil).
        and change { users_result.norm_id }.from(norm.id).to(nil).
        and change { users_result.norm_type }.from('ETI').to(nil).
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
        and(change { user_report.status }.from('prepared').to('generating')))
    end

    it 'doesnt change users_result id on users_assessment' do
      expect { subject }.to_not change(user_assessment, :users_result_id)
    end

    it 'remove media response record associated with users_result' do
      expect { subject }.to change { MediaResponse.count }.by(-1)
      expect(MediaResponse.find_by(id: media_response.id)).to be_nil
    end
  end

  context 'for user result associated with multiple assessments' do
    subject { described_class.call(user_assessments.first) }

    it 'creates new user_result record with blank data' do
      expect { subject }.to change { UsersResult.count }.by(1)

      expect(UsersResult.last.answers).to eq({})
      expect(UsersResult.last.scoring).to be_nil
      expect(UsersResult.last.embedded_data).to be_nil
      expect(UsersResult.last.norm_id).to be_nil
      expect(UsersResult.last.norm_type).to be_nil
      expect(UsersResult.last.occupations).to be_nil
      expect(UsersResult.last.status).to eq('not_started')
      expect(UsersResult.last.completed_at).to be_nil
      expect(UsersResult.last.step).to eq(0)
      expect(UsersResult.last.expiry_date).to be_nil
      expect(UsersResult.last.last_activity_at).to be_nil
    end

    it 'updates users_result_id on user_assessment record referring to newly created record' do
      exiting_id = user_assessments.first.users_result_id
      subject
      expect(user_assessments.first.reload.users_result_id).not_to eq(exiting_id)
      expect(user_assessments.first.reload.users_result_id).to eq(UsersResult.last.id)
    end

    it 'doesnt remove user_report data if users_result is not completed' do
      expect { subject }.to_not change(user_report1, :pdf_identifier)
    end

    it 'doesnt delete media_response record' do
      expect { subject }.to change { MediaResponse.count }.by(0)
      expect(MediaResponse.find_by(id: media_response1.id)).to eq(media_response1)
    end
  end
end
