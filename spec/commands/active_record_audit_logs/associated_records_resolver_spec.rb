# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveRecordAuditLogs::AssociatedRecordsResolver do
  describe '.call!' do
    context 'when the record type has no mapped associations' do
      let(:dimension) { create(:dimension) }

      it 'returns only the root record' do
        expect(described_class.call!(dimension)).to contain_exactly(dimension)
      end
    end

    context 'when the record has mapped associations' do
      let(:assessment) { create(:assessment) }
      let!(:block) { create(:block, assessment: assessment) }

      it 'includes the root record and its associated records' do
        result = described_class.call!(assessment)

        expect(result).to include(assessment, block)
      end

      it 'does not return duplicate records' do
        result = described_class.call!(assessment)

        expect(result.uniq).to eq(result)
      end
    end

    context 'when the root is a workshop' do
      let(:campaign) { create(:campaign) }
      let(:group) { create(:campaign_assessment_group, campaign: campaign) }
      let(:workshop) { create(:workshop, campaign: campaign, campaign_assessment_group: group) }
      let!(:workshop_assessor) { create(:workshop_assessor, workshop: workshop) }
      let!(:workshop_resource) { create(:workshop_resource, workshop: workshop) }

      it 'includes must-have workshop associations for tracing' do
        result = described_class.call!(workshop)

        expect(result).to include(workshop, workshop_assessor, workshop_resource)
      end
    end
  end
end
