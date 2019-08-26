
require 'rails_helper'

describe Threesixty::Emails::RecipientByCriteria do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }
  let!(:threesixty_evaluator) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }

  context 'recipient_criteria is blank' do
    it 'sends all subjects as recipeint if it is and email for subjects' do
      results = described_class.call!(threesixty_campaign: threesixty_campaign, email_name: ::Threesixty::Emails::Name::SUBJECT_INVITE)

      expect(results).to match_array([threesixty_subject.user])
    end

    it "doesn't sends evaluators that has no evaluation apart from self" do
      create(
        :threesixty_participant,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        subject_id: threesixty_evaluator.user_id
      )

      results = described_class.call!(threesixty_campaign: threesixty_campaign, email_name: ::Threesixty::Emails::Name::EVALUATOR_INVITE)

      expect(results).to be_blank
    end

    it 'sends evaluators that has atleast on evaluation apart from self' do
      create(
        :threesixty_participant,
        campaign: threesixty_campaign.campaign,
        evaluator_id: threesixty_evaluator.user_id,
        subject_id: threesixty_subject.user_id
      )

      results = described_class.call!(threesixty_campaign: threesixty_campaign, email_name: ::Threesixty::Emails::Name::EVALUATOR_INVITE)

      expect(results).to match_array([threesixty_evaluator.user])
    end

    it 'sends both subjects and evalautors if it is a custom email' do
      results = described_class.call!(threesixty_campaign: threesixty_campaign, email_name: ::Threesixty::Emails::Name::CUSTOM_MESSAGE)

      expect(results).to match_array([threesixty_subject.user, threesixty_evaluator.user])
    end
  end

  context 'recipient_criteria is present' do
    it 'calls Threesixty::ParticipatorByCriteria::Filter' do
      expect(Threesixty::ParticipatorByCriteria::Filter).to receive(:call!).and_return([threesixty_subject, threesixty_evaluator])

      described_class.call!(
        threesixty_campaign: threesixty_campaign,
        email_name: ::Threesixty::Emails::Name::EVALUATOR_INVITE,
        recipient_criteria: [{ 'field' => 'evalautions', 'value' => 'completed' }]
      )
    end
  end

  context 'adds default criteria' do
    it 'adds default criteria for subject_reminder email' do
      default_recipient_criteria = { 'field' => 'subject_status', 'value' => Threesixty::Participants::GetStatus::NOT_COMPLETED }
      expect(Threesixty::ParticipatorByCriteria::Filter).to receive(:call!).
        with(
          threesixty_campaign: threesixty_campaign,
          participator_types: [:subject],
          criteria_list: [default_recipient_criteria],
          email_name: 'subject_reminder'
        ).and_return([threesixty_subject, threesixty_evaluator])

      described_class.call!(
        threesixty_campaign: threesixty_campaign,
        email_name: ::Threesixty::Emails::Name::SUBJECT_REMINDER,
      )
    end

    it 'adds default criteria for evaluator_invite email' do
      default_recipient_criteria = [{ "field" => "atleast_one_non_self_evalaution" }]
      expect(Threesixty::ParticipatorByCriteria::Filter).to receive(:call!).
        with(
          threesixty_campaign: threesixty_campaign,
          participator_types: [:evaluator],
          criteria_list: default_recipient_criteria,
          email_name: 'evaluator_invite'
        ).and_return([threesixty_subject, threesixty_evaluator])

      described_class.call!(
        threesixty_campaign: threesixty_campaign,
        email_name: ::Threesixty::Emails::Name::EVALUATOR_INVITE,
      )
    end

    it 'adds default criteria for evaluator_reminder email' do
      default_recipient_criteria = [
        {"field"=>"atleast_one_non_self_evalaution"},
        { 'field' => 'evaluations', 'value' => 'not_completed', 'exclude_self_evaluations' => true }
      ]
      expect(Threesixty::ParticipatorByCriteria::Filter).to receive(:call!).
        with(
          threesixty_campaign: threesixty_campaign,
          participator_types: [:evaluator],
          criteria_list: default_recipient_criteria,
          email_name: 'evaluator_reminder'
        ).and_return([threesixty_subject, threesixty_evaluator])

      described_class.call!(
        threesixty_campaign: threesixty_campaign,
        email_name: ::Threesixty::Emails::Name::EVALUATOR_REMINDER,
      )
    end
  end
end
