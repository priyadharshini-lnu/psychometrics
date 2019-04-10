# frozen_string_literal: true

require 'rails_helper'

describe ReportSerializer do
  let(:report) { create(:report, data_sheet_columns: [{ 'name' => 'field1', 'type' => 'HTML' }]) }
  let(:threesixty_report) { create(:report, data_sheet_columns: [{ 'name' => 'field1', 'type' => 'HTML' }], category: :threesixty) }
  let(:campaign) { create(:campaign) }

  before do
    create(:threesixty_campaign, report: report, campaign: campaign)
  end
  describe '#relationships' do
    let(:another_campaign) { create(:campaign) }

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
      create(:relationship, name: 'manager', type: :global)
      create(:relationship, name: 'peer', type: :campaign, campaign: campaign)
      create(:relationship, name: 'self', type: :campaign, campaign: another_campaign)

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

  describe '#data_sheet_columns' do
    describe 'common report' do
      it { expect(described_class.new(report).data_sheet_columns).to eq [{ 'name' => 'field1', 'type' => 'HTML' }] }
    end
    describe 'threesixty report' do
      before do
        allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
        create(:datasheet, columns: { 'field1' => 'Text', 'field2' => 'Number' }, project: campaign.project)
      end

      it {
        expect(described_class.new(report).data_sheet_columns).to eq [
          { name: 'field1', type: 'Text' },
          { name: 'field2', type: 'Number' }
        ]
      }
    end
  end

  describe "#to_hash" do
    before do
      create(:datasheet, columns: { 'field1' => 'Text', 'field2' => 'Number' }, project: campaign.project)
      create(:threesixty_campaign, report: threesixty_report, campaign: campaign)
    end

    it do
      data = described_class.new(threesixty_report).to_hash
      expect(data[:category]).to eq 'threesixty'
    end
  end
end
