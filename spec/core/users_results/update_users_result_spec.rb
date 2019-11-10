# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::UpdateUsersResult do
  let(:users_result) { double('users_result', subject: 'subject', evaluator: 'evaluator') }
  let(:evaluator_user) { double('user', id: 1) }
  let(:threesixty_campaign) { double('threesixty_campaign', id: 1) }

  subject { described_class.call(form, users_result, threesixty_campaign) }

  context 'form is invalid' do
    let(:form) { double('form', 'invalid?': true) }

    it 'broadcast :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:update_users_result)
      expect_any_instance_of(described_class).not_to receive(:generate_360_report)
      subject
    end
  end

  it 'calls method for sending required mails' do
    form = double('form', 'invalid?': false)
    threesixty_subject = double
    allow_any_instance_of(described_class).to receive(:update_users_result)
    allow_any_instance_of(described_class).to receive(:generate_360_report)
    allow(users_result).to receive(:'completed?').and_return(true)
    allow(users_result).to receive(:threesixty_subject).and_return(threesixty_subject)

    expect(Threesixty::Emails::Send).to receive(:call!).
      with('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    expect(Threesixty::Emails::Send).to receive(:call!).
      with('manager_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    expect(Threesixty::Emails::Send).to receive(:call!).
      with('approve_report', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    described_class.call(form, users_result, threesixty_campaign)
  end

  context '360 campaign' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let!(:option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
    let(:campaign)        { threesixty_campaign.campaign }
    let(:project)         { campaign.project }
    let(:assessment)      { threesixty_campaign.assessment }
    let(:report)          { threesixty_campaign.report }
    let(:subject_membership) { create(:membership, client: project) }
    let(:subject_user) { subject_membership.user }
    let(:evaluator_membership) { create(:membership, client: project) }
    let(:evaluator_user)  { evaluator_membership.user }
    let!(:users_result)   do
      create(:users_result, assessment: assessment,
                                                  subject: subject_user,
                                                  evaluator: evaluator_user,
                                                  answers: {},
                                                  step: 3)
    end
    let(:users_report) do
      create(:users_report, user: subject_user,
                                                  campaign: campaign,
                                                  report: report)
    end
    let(:form)            { double('form', 'invalid?': false, attributes: {}) }

    it { expect { subject }.to broadcast(:ok) }
    it { expect { subject }.not_to broadcast(:invalid) }

    context '#update_assign' do
      after { described_class.call(form, users_result, threesixty_campaign) }
      subject { users_result }

      it { is_expected.to receive(:assign_attributes).with(form.attributes) }
      it { is_expected.to receive(:save!).at_least(:once) }

      context 'users_result is completed' do
        before do
          allow(users_result).to receive(:'completed?').and_return(true)
        end

        it { expect(::UsersResults::ExpandAnswersByRecoding).to receive(:call!).with(subject) }
        it { expect(::UsersResults::CalculateScoring).to receive(:call!).with(subject) }
        it { expect(::Assigns::CalculateOccupations).to receive(:call!).with(subject) }
        it { is_expected.to receive(:'completed_at=').with(Time.now) }
      end
    end

    context '#generate_report' do
      before { allow(users_result).to receive(:'completed?').and_return(true) }
      subject { described_class.call(form, users_result, threesixty_campaign) }

      context 'report is enabled' do
        it 'sets generating status' do
          expect { subject }.to change { users_report.reload.generating? }.from(false).to(true)
        end
        it 'sends to generate report' do
          expect(::UsersReports::GeneratePdfJob).to receive(:perform_later).with(users_report, subject_user)
          subject
        end
      end

      context 'report is disabled' do
        before(:each) { report.update_column(:disabled, true) }
        it 'dont sets generating status' do
          subject
          expect(users_report.reload.generating?).to be_falsy
        end
        it 'dont sends to generate report' do
          expect(::UsersReports::GeneratePdfJob).not_to receive(:perform_later).with(users_report, subject_user)
          subject
        end
      end
    end
  end
end
