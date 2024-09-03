# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::UpdateUsersResult do
  let(:threesixty_campaign) { double('threesixty_campaign', id: 1) }
  let(:users_result) do
    double('users_result', subject: 'subject', evaluator: 'evaluator', threesixty_campaign: threesixty_campaign,
      user_assessment: UserAssessment.new(campaign: build(:campaign)))
  end
  let!(:norm) { create(:norm) }

  let(:evaluator_user) { double('user', id: 1) }

  subject { described_class.call(form, users_result, evaluator_user) }

  context 'form is invalid' do
    let(:form) { double('form', invalid?: true) }

    it 'broadcast :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:update_users_result)
      subject
    end
  end

  it 'calls method for sending required mails' do
    form = double('form', invalid?: false)
    threesixty_subject = double
    allow_any_instance_of(described_class).to receive(:update_users_result)
    allow(users_result).to receive(:user_assessment).and_return(
      UserAssessment.new(campaign: build(:campaign))
    )
    allow(users_result).to receive(:completed?).and_return(true)
    allow(users_result).to receive(:campaign).and_return(threesixty_campaign)
    allow(users_result).to receive(:threesixty_subject).and_return(threesixty_subject)

    expect(Threesixty::Emails::Send).to receive(:call!).
      with('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    expect(Threesixty::Emails::Send).to receive(:call!).
      with('manager_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    expect(Threesixty::Emails::Send).to receive(:call!).
      with('approve_report', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    described_class.call(form, users_result, evaluator_user)
  end

  describe 'progress_reseted assessment' do
    let(:form) { double('form', invalid?: false, attributes_with_values: { answers: { '1' => {} } }) }
    let(:user_assessment) { create(:user_assessment, progress_reseted: true) }

    it 'should save dirty results and change progress_reseted to false' do
      users_result = user_assessment.users_result

      described_class.call(form, users_result, evaluator_user)

      expect(user_assessment.progress_reseted).to be_falsey
      expect(users_result.answers).to eq({ '1' => { 'dirty' => true } })
    end
  end

  describe 'completed assessment' do
    let(:form) { double('form', invalid?: false, attributes_with_values: { norm_id: norm.id }) }
    let(:user_assessment) { create(:user_assessment, status: 'completed') }

    before do
      allow(::UsersResults::SaveScoringWithCallbacksJob).to receive(:perform_later)
    end

    it 'updates completed_at and norm_id' do
      users_result = user_assessment.users_result

      described_class.call(form, users_result, evaluator_user)

      expect(user_assessment.completed_at).to be_present
      expect(user_assessment.norm_id).to be_present
    end

    it 'enqueues SaveScoringWithCallbacksJob' do
      users_result = user_assessment.users_result

      described_class.call(form, users_result, evaluator_user)

      expect(::UsersResults::SaveScoringWithCallbacksJob).to have_received(:perform_later).with(users_result,
                                                                                                evaluator_user)
    end
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
    let(:evaluator_membership) { create(:membership, client: project, user: create(:user, project: project)) }
    let(:evaluator_user) { evaluator_membership.user }
    let(:user_assessment) { create(:user_assessment, campaign: campaign, evaluator: evaluator_user) }
    let!(:users_result) do
      create(:users_result, assessment: assessment,
                                                  campaign: campaign,
                                                  subject: subject_user,
                                                  evaluator: evaluator_user,
                                                  user_assessment: user_assessment,
                                                  answers: {},
                                                  step: 3)
    end
    let(:user_report) do
      create(:user_report, user: subject_user,
                                                  campaign: campaign,
                                                  report: report)
    end
    let(:form) { double('form', invalid?: false, attributes_with_values: {}) }
    let!(:participant) { users_result.participant }
    let!(:manager) { create(:relationship, name: 'Manager', type: :global) }

    it { expect { subject }.to broadcast(:ok) }
    it { expect { subject }.not_to broadcast(:invalid) }

    context '#update_assign' do
      after { described_class.call(form, users_result, evaluator_user) }
      subject { users_result }

      it { is_expected.to receive(:assign_attributes).with(form.attributes_with_values) }
      it { is_expected.to receive(:save!).at_least(:once) }

      context 'users_result is completed' do
        before do
          allow(users_result.user_assessment).to receive(:completed?).and_return(true)
          allow(::UsersResults::SaveScoringWithCallbacksJob).to receive(:perform_later)
        end

        it 'enqueues SaveScoringWithCallbacksJob' do
          described_class.call(form, users_result, evaluator_user)

          expect(::UsersResults::SaveScoringWithCallbacksJob).to have_received(:perform_later).with(users_result,
                                                                                                    evaluator_user)
        end
      end
    end
  end
end
