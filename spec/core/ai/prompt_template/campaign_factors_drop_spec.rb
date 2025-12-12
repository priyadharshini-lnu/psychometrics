# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::PromptTemplate::CampaignFactorsDrop do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:leadership_group) { create(:campaign_factor_group, name: 'Leadership', campaign: campaign) }
  let(:technical_group) { create(:campaign_factor_group, name: 'Technical Skills', campaign: campaign) }

  let!(:innovation_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: leadership_group,
           name: 'Innovation Explorer',
           code: 'innovation_explorer',
           description: 'Measures innovation capabilities',
           output_type: :numeric,
           position: 1)
  end

  let!(:results_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: leadership_group,
           name: 'Results Driver',
           code: 'results_driver',
           description: 'Measures results-driven behavior',
           output_type: :string,
           position: 2)
  end

  let!(:technical_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: technical_group,
           name: 'Problem Solving',
           code: 'problem_solving',
           description: 'Measures problem-solving skills',
           output_type: :numeric,
           position: 3)
  end

  let!(:innovation_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: innovation_factor,
           numeric_value: 8.5)
  end

  let!(:results_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: results_factor,
           string_value: 'High')
  end

  let!(:technical_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: technical_factor,
           numeric_value: 7.2)
  end

  let(:campaign_factors_drop) { described_class.new(campaign, user) }

  describe '#initialize' do
    it 'initializes with campaign and user' do
      expect(campaign_factors_drop.instance_variable_get(:@campaign)).to eq(campaign)
      expect(campaign_factors_drop.instance_variable_get(:@user)).to eq(user)
    end

    it 'can be initialized with only campaign' do
      drop = described_class.new(campaign)
      expect(drop.instance_variable_get(:@campaign)).to eq(campaign)
      expect(drop.instance_variable_get(:@user)).to be_nil
    end
  end

  describe '#liquid_method_missing' do
    it 'returns factor drop for valid code' do
      factor_drop = campaign_factors_drop.liquid_method_missing('innovation_explorer')

      expect(factor_drop).to be_a(AI::PromptTemplate::CampaignFactorDrop)
      expect(factor_drop.code).to eq('innovation_explorer')
      expect(factor_drop.name).to eq('Innovation Explorer')
    end

    it 'returns nil for non-existent factor code' do
      factor_drop = campaign_factors_drop.liquid_method_missing('nonexistent_factor')
      expect(factor_drop).to be_nil
    end
  end

  describe '#each' do
    it 'yields campaign factor drops for each factor' do
      yielded_factors = campaign_factors_drop.map { |factor| factor }

      expect(yielded_factors.length).to eq(3)
      expect(yielded_factors).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

      codes = yielded_factors.map(&:code)
      expect(codes).to contain_exactly('innovation_explorer', 'results_driver', 'problem_solving')
    end

    it 'passes user to each factor drop' do
      campaign_factors_drop.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end
  end

  describe '#size' do
    it 'returns the count of campaign factors' do
      expect(campaign_factors_drop.size).to eq(3)
    end

    context 'when no factors exist' do
      let(:empty_campaign) { create(:campaign) }
      let(:empty_drop) { described_class.new(empty_campaign, user) }

      it 'returns 0' do
        expect(empty_drop.size).to eq(0)
      end
    end
  end

  describe '#to_a' do
    it 'returns array of campaign factor drops' do
      factor_array = campaign_factors_drop.to_a

      expect(factor_array).to be_an(Array)
      expect(factor_array.length).to eq(3)
      expect(factor_array).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

      codes = factor_array.map(&:code)
      expect(codes).to contain_exactly('innovation_explorer', 'results_driver', 'problem_solving')
    end

    it 'passes user to each factor drop in array' do
      factor_array = campaign_factors_drop.to_a
      factor_array.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end
  end

  describe '#by_group' do
    it 'filters factors by group name' do
      leadership_factors = campaign_factors_drop.by_group('Leadership')

      expect(leadership_factors.length).to eq(2)
      expect(leadership_factors).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

      codes = leadership_factors.map(&:code)
      expect(codes).to contain_exactly('innovation_explorer', 'results_driver')
    end

    it 'returns empty array for non-existent group' do
      factors = campaign_factors_drop.by_group('Non-existent Group')
      expect(factors).to be_empty
    end

    it 'passes user to filtered factor drops' do
      leadership_factors = campaign_factors_drop.by_group('Leadership')
      leadership_factors.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end
  end

  describe '#by_codes' do
    it 'filters factors by array of codes' do
      codes = %w[innovation_explorer problem_solving]
      filtered_factors = campaign_factors_drop.by_codes(codes)

      expect(filtered_factors.length).to eq(2)
      expect(filtered_factors).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

      returned_codes = filtered_factors.map(&:code)
      expect(returned_codes).to contain_exactly('innovation_explorer', 'problem_solving')
    end

    it 'returns empty array for non-existent codes' do
      codes = %w[non_existent_code1 non_existent_code2]
      filtered_factors = campaign_factors_drop.by_codes(codes)
      expect(filtered_factors).to be_empty
    end

    it 'filters out non-existent codes and returns only valid ones' do
      codes = %w[innovation_explorer non_existent_code results_driver]
      filtered_factors = campaign_factors_drop.by_codes(codes)

      expect(filtered_factors.length).to eq(2)
      returned_codes = filtered_factors.map(&:code)
      expect(returned_codes).to contain_exactly('innovation_explorer', 'results_driver')
    end

    it 'passes user to filtered factor drops' do
      codes = %w[innovation_explorer results_driver]
      filtered_factors = campaign_factors_drop.by_codes(codes)

      filtered_factors.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end
  end
end
