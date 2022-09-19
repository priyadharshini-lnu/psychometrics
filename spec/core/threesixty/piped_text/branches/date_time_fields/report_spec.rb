# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DateTimeFields::Report do
  describe '.call' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

    it 'returns self evaluation date' do
      completed_at = Time.zone.now
      create(
        :user_assessment,
        subject_id: subject.user_id,
        evaluator_id: subject.user_id,
        completed_at: completed_at,
        campaign: threesixty_campaign.campaign,
        status: :completed
      )

      response = described_class.call!(
        %w[Report SelfEvaluation],
        { 'f' => '%-d/%-m/%Y' },
        threesixty_campaign: threesixty_campaign, subject: subject.user
      )

      expect(response).to eq(completed_at.strftime('%-d/%-m/%Y'))
    end

    it 'returns last evaluation date for subject' do
      last_completed_at = Time.zone.now
      evaluators = create_list(:threesixty_evaluator, 2, campaign: threesixty_campaign.campaign)
      create(
        :user_assessment,
        subject_id: subject.user_id,
        evaluator_id: evaluators[0].user_id,
        completed_at: Time.zone.now.advance(days: -1),
        campaign: threesixty_campaign.campaign,
        status: :completed
      )
      create(
        :user_assessment,
        subject_id: subject.user_id,
        evaluator_id: evaluators[1].user_id,
        completed_at: last_completed_at,
        campaign: threesixty_campaign.campaign,
        status: :completed
      )

      response = described_class.call!(
        %w[Report LastEvaluation],
        { 'f' => '%-d/%-m/%Y' },
        threesixty_campaign: threesixty_campaign, subject: subject.user
      )

      expect(response).to eq(last_completed_at.strftime('%-d/%-m/%Y'))
    end
  end
end
