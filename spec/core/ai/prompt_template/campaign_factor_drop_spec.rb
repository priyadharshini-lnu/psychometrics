# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::PromptTemplate::CampaignFactorDrop do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }

  let(:numeric_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: campaign_factor_group,
           name: 'Innovation Score',
           code: 'innovation_score',
           description: 'Measures innovation capabilities',
           output_type: :numeric,
           factor_type: 'formula',
           position: 1)
  end

  let(:string_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: campaign_factor_group,
           name: 'Leadership Level',
           code: 'leadership_level',
           description: 'Measures leadership effectiveness',
           output_type: :string,
           factor_type: 'assessment',
           position: 2)
  end

  let!(:numeric_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: numeric_factor,
           numeric_value: 8.5)
  end

  let!(:string_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: string_factor,
           string_value: 'Expert')
  end

  describe 'delegated attributes' do
    let(:factor_drop) { described_class.new(numeric_factor, user) }

    describe '#name' do
      it 'returns the campaign factor name' do
        expect(factor_drop.name).to eq('Innovation Score')
      end
    end

    describe '#code' do
      it 'returns the campaign factor code' do
        expect(factor_drop.code).to eq('innovation_score')
      end
    end

    describe '#description' do
      it 'returns the campaign factor description' do
        expect(factor_drop.description).to eq('Measures innovation capabilities')
      end
    end

    describe '#output_type' do
      it 'returns the campaign factor output type' do
        expect(factor_drop.output_type).to eq('numeric')
      end
    end

    describe '#factor_type' do
      it 'returns the campaign factor type' do
        expect(factor_drop.factor_type).to eq('formula')
      end
    end

    describe '#position' do
      it 'returns the campaign factor position' do
        expect(factor_drop.position).to eq(1)
      end
    end
  end

  describe 'value methods' do
    context 'with numeric factor' do
      let(:factor_drop) { described_class.new(numeric_factor, user) }

      describe '#value' do
        it 'returns the numeric value' do
          expect(factor_drop.value).to eq(8.5)
        end

        it 'prefers numeric value over string value' do
          # Update the existing value with both numeric and string values
          numeric_value.update!(numeric_value: 9.5, string_value: 'High')

          expect(factor_drop.value).to eq(9.5)
        end
      end

      describe '#numeric_value' do
        it 'returns the numeric value' do
          expect(factor_drop.numeric_value).to eq(8.5)
        end
      end

      describe '#string_value' do
        it 'returns nil for numeric factor' do
          expect(factor_drop.string_value).to be_nil
        end
      end
    end

    context 'when user is nil' do
      let(:factor_drop) { described_class.new(numeric_factor, nil) }

      describe '#value' do
        it 'returns nil when user is nil' do
          expect(factor_drop.value).to be_nil
        end
      end

      describe '#numeric_value' do
        it 'returns nil when user is nil' do
          expect(factor_drop.numeric_value).to be_nil
        end
      end

      describe '#string_value' do
        it 'returns nil when user is nil' do
          expect(factor_drop.string_value).to be_nil
        end
      end
    end
  end
end
