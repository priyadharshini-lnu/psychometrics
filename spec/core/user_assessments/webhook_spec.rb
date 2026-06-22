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
      Current.user = subject
      first_assessment_tags = %w[first-tag1 first-tag2]
      assessment.tag_list.add(first_assessment_tags)
      assessment.save!
      second_assessment = create(:assessment, name: 'Agile')
      create(
        :user_assessment,
        campaign: campaign,
        assessment: second_assessment,
        subject: subject,
        evaluator: subject,
        status: :completed
      )
      second_assessment_tags = %w[second-tag1 second-tag2]
      second_assessment.tag_list.add(second_assessment_tags)
      second_assessment.save!
      third_assessment = create(:assessment, name: 'Leadership')
      create(
        :user_assessment,
        campaign: campaign,
        assessment: third_assessment,
        subject: subject,
        evaluator: subject,
        status: :in_progress
      )
      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :campaign_user_assessment_summary,
        hash_including(
          campaign: campaign,
          subject: subject,
          assessments: contain_exactly(
            { id: assessment.id, name: 'Thriving Index', status: 'not_started', tags: first_assessment_tags },
            { id: second_assessment.id, name: 'Agile', status: 'completed', tags: second_assessment_tags },
            { id: third_assessment.id, name: 'Leadership', status: 'in_progress', tags: [] }
          )
        ),
        record: user_assessment
      )

      described_class.new(user_assessment).publish_campaign_user_assessment_summary
    end

    it 'does not include assessor assessments in the payload' do
      assessor = create(:user)
      assessor_user_assessment = create(:user_assessment, campaign: campaign, assessment: create(:assessment),
                                                     subject: subject, evaluator: assessor)

      expect(WebhookSubscriptions::Publish).to receive(:call) do |_, _, data, **|
        ids = data[:assessments].pluck(:id)
        expect(ids).to include(user_assessment.assessment_id)
        expect(ids).not_to include(assessor_user_assessment.assessment_id)
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
