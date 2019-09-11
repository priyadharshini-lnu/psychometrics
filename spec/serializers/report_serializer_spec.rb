# frozen_string_literal: true

require 'rails_helper'

describe ReportSerializer do
  let(:common_report) { create(:report, data_sheet_columns: [{ 'name' => 'field1', 'type' => 'HTML' }]) }
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:campaign) { threesixty_campaign.campaign }
  let(:report) do
    report = threesixty_campaign.report
    report.update_attributes(data_sheet_columns: [{ 'name' => 'field1', 'type' => 'HTML' }])
    report
  end

  describe '#relationships' do
    let(:another_campaign) { create(:campaign) }

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
      create(:relationship, id: 1001, name: 'manager', type: :global)
      create(:relationship, id: 1002, name: 'peer', type: :campaign, campaign: campaign)
      create(:relationship, id: 1003, name: 'self', type: :campaign, campaign: another_campaign)
    end

    it do
      relationships = described_class.new(report).relationships
      expect(relationships).to match_array [
        { id: 1001, type: 'global', name: 'manager', assign_type: 'manual' },
        { id: 1002, type: 'campaign', name: 'peer', assign_type: 'manual' }
      ]
    end
  end

  describe '#data_sheet_columns' do
    describe 'common report' do
      it {
        expect(described_class.new(common_report).data_sheet_columns).
          to eq [{ 'name' => 'field1', 'type' => 'HTML' }]
      }
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

  describe '#to_hash' do
    before do
      create(:datasheet, columns: { 'field1' => 'Text', 'field2' => 'Number' }, project: campaign.project)
    end

    it do
      data = described_class.new(report).to_hash
      expect(data[:category]).to eq 'threesixty'
    end
  end
end
