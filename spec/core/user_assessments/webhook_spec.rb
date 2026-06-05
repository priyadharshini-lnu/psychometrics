# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessments::Webhook do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment, name: 'Thriving Index') }
  let(:subject) { create(:user) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: subject,
                             evaluator: subject)
  end
  let!(:webhook) do
    create(:webhook, :with_topics, project_id: campaign.project_id,
                                   names: %w[campaign_user_assessment_summary])
  end

  describe '#publish_campaign_user_assessment_summary' do
    it 'calls Publish with all subject assessments for the campaign' do
      second_assessment = create(:assessment, name: 'Agile')
      second_user_assessment = create(
        :user_assessment,
        campaign: campaign,
        assessment: second_assessment,
        subject: subject,
        evaluator: subject,
        status: :completed
      )

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :campaign_user_assessment_summary,
        hash_including(
          campaign: campaign,
          subject: subject,
          assessments: contain_exactly(
            { id: user_assessment.id, name: 'Thriving Index', status: 'not_started' },
            { id: second_user_assessment.id, name: 'Agile', status: 'completed' }
          )
        ),
        record: user_assessment
      )

      described_class.new(user_assessment).publish_campaign_user_assessment_summary
    end

    it 'does not include assessor assessments in the payload' do
      assessor = create(:user)
      assessor_assessment = create(:user_assessment, campaign: campaign, assessment: assessment,
                                                     subject: subject, evaluator: assessor)

      expect(WebhookSubscriptions::Publish).to receive(:call) do |_, _, data, **|
        ids = data[:assessments].pluck(:id)
        expect(ids).to include(user_assessment.id)
        expect(ids).not_to include(assessor_assessment.id)
      end

      described_class.new(user_assessment).publish_campaign_user_assessment_summary
    end

    it 'uses status enum values in payload' do
      expect(WebhookSubscriptions::Publish).to receive(:call) do |_, _, data, **|
        statuses = data[:assessments].pluck(:status)
        expect(statuses).to all(match(/\A[a-z_]+\z/))
      end

      described_class.new(user_assessment).publish_campaign_user_assessment_summary
    end
  end
end
