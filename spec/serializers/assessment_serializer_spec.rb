# frozen_string_literal: true

require 'rails_helper'

describe AssessmentSerializer do
  describe 'threesixty' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:assessment) { threesixty_campaign.assessment }
    let(:campaign) { threesixty_campaign.campaign }

    describe '#relationships' do
      it { expect(described_class.new(context: {}).serialize(assessment)['relationships']).to eq [] }
    end

    describe '#data_sheet_columns' do
      describe 'common assessment' do
        it { expect(described_class.new(context: {}).serialize(assessment)['data_sheet_columns']).to eq [] }
      end

      describe 'threesixty assessment' do
        before do
          allow_any_instance_of(Assessment).to receive(:threesixty?).and_return(true)
          datasheet = create(:datasheet, project: campaign.project)
          create(:sheet_column, sheet: datasheet, name: 'field1', column_type: 'text')
          create(:sheet_column, sheet: datasheet, name: 'field2', column_type: 'number')
        end

        it {
          expect(described_class.new(context: {}).serialize(assessment)['data_sheet_columns']).
            to eq [
              { 'name' => 'field1', 'type' => 'Text' },
              { 'name' => 'field2', 'type' => 'Number' }
            ]
        }
      end
    end
  end
end
