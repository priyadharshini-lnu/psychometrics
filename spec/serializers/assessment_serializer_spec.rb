# frozen_string_literal: true

require 'rails_helper'

describe AssessmentSerializer do
  describe 'threesixty' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:assessment) { threesixty_campaign.assessment }
    let(:campaign) { threesixty_campaign.campaign }

    describe '#relationships' do
      it { expect(described_class.new(assessment).relationships).to eq [] }
    end

    describe '#data_sheet_columns' do
      describe 'common assessment' do
        it { expect(described_class.new(assessment).data_sheet_columns).to eq [] }
      end

      describe 'threesixty assessment' do
        before do
          allow_any_instance_of(Assessment).to receive(:threesixty?).and_return(true)
          create(:datasheet, columns: { 'field1' => 'Text', 'field2' => 'Number' }, project: campaign.project)
        end

        it {
          expect(described_class.new(assessment).data_sheet_columns).to eq [
            { name: 'field1', type: 'Text' },
            { name: 'field2', type: 'Number' }
          ]
        }
      end
    end
  end
end
