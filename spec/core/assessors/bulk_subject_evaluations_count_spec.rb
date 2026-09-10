# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::BulkSubjectEvaluationsCount do
  describe '#call' do
    let(:current_user) { create(:user, :assessor) }
    let(:campaign) { current_user.assessors.first.campaign }
    let(:subject_user) { create(:user) }
    let(:assessment) { create(:assessment, category: :assessor_form) }

    let(:service) do
      described_class.new(
        [subject_user.id],
        current_user,
        [campaign.id],
        assessment_category: :assessor_form
      )
    end

    before do
      create(:user_assessment,
             campaign: campaign,
             subject: subject_user,
             evaluator: current_user,
             assessment: assessment,
             relationship: Relationship.assessor_relationship,
             status: :completed)

      create(:user_assessment,
             campaign: campaign,
             subject: subject_user,
             evaluator: current_user,
             assessment: assessment,
             relationship: Relationship.assessor_relationship,
             status: :not_started)
    end

    it 'returns grouped evaluations count by campaign and subject' do
      result = described_class.call!(
        [subject_user.id], current_user, [campaign.id], assessment_category: :assessor_form
      )

      expect(result).to be_a(Hash)
      expect(result[campaign.id]).to be_a(Hash)

      counts = result[campaign.id][subject_user.id]
      expect(counts[:completed]).to eq(1)
      expect(counts[:not_started]).to eq(1)
      expect(counts[:total]).to eq(2)

      # It also includes zero counts for other statuses
      expect(counts[:in_progress]).to eq(0)
    end

    it 'handles null statuses gracefully' do
      # Simulate a bad record where status is nil at DB level
      create(:user_assessment,
             campaign: campaign,
             subject: subject_user,
             evaluator: current_user,
             assessment: assessment,
             relationship: Relationship.assessor_relationship).update_column(:status, nil)

      result = described_class.call!(
        [subject_user.id], current_user, [campaign.id], assessment_category: :assessor_form
      )
      counts = result[campaign.id][subject_user.id]

      # total is 3 because there are 3 user assessments matching, but the nil status is ignored for group mapping
      expect(counts[:total]).to eq(3)
      expect(counts[:completed]).to eq(1)
      expect(counts[:not_started]).to eq(1)
    end
  end
end
