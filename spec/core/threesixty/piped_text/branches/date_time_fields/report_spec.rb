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

    it 'returns nil when there are no report results' do
      response = described_class.call!(
        %w[Report AssessmentCompletedAt],
        { 'f' => '%-d/%-m/%Y' },
        subject: subject.user, report_results: []
      )

      expect(response).to be_nil
    end

    it 'returns a single formatted date when all report results completed on the same day' do
      completed_at = Time.zone.now
      report_results = [double('result', completed_at: completed_at), double('result', completed_at: completed_at)]

      response = described_class.call!(
        %w[Report AssessmentCompletedAt],
        { 'f' => '%-d/%-m/%Y' },
        subject: subject.user, report_results: report_results
      )

      expect(response).to eq(completed_at.strftime('%-d/%-m/%Y'))
    end

    it 'returns a formatted date range when report results completed on different days' do
      earlier = 3.days.ago
      later = Time.zone.now
      report_results = [double('result', completed_at: earlier), double('result', completed_at: later)]

      response = described_class.call!(
        %w[Report AssessmentCompletedAt],
        { 'f' => '%-d/%-m/%Y' },
        subject: subject.user, report_results: report_results
      )

      expect(response).to eq("#{earlier.strftime('%-d/%-m/%Y')} - #{later.strftime('%-d/%-m/%Y')}")
    end
  end
end
