# frozen_string_literal: true

require 'rails_helper'

describe ReportSerializer do
  describe '#relationships' do
    let(:report) { create(:report) }

    let(:campaign) { create(:campaign) }
    let(:another_campaign) { create(:campaign) }

    before do
      allow_any_instance_of(Report).to receive(:threesixty?).and_return(true)
      create(:relationship, name: 'manager', type: :global)
      create(:relationship, name: 'peer', type: :campaign, campaign: campaign)
      create(:relationship, name: 'self', type: :campaign, campaign: another_campaign)

      create(:threesixty_campaign, report: report, campaign: campaign)
      create(:threesixty_campaign, report: create(:report))
    end

    it do
      relationships = described_class.new(report).relationships
      expect(relationships).to match_array [
        { type: 'global', name: 'manager' },
        { type: 'campaign', name: 'peer' }
      ]
    end
  end
end
