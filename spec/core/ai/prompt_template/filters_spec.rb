# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::PromptTemplate::Filters do
  # Create a test class that includes the filters module
  let(:test_class) do
    Class.new do
      include AI::PromptTemplate::Filters
    end
  end

  let(:filter_instance) { test_class.new }
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }

  # Create campaign factor groups
  let(:leadership_group) { create(:campaign_factor_group, name: 'Leadership', campaign: campaign) }
  let(:technical_group) { create(:campaign_factor_group, name: 'Technical Skills', campaign: campaign) }
  let(:communication_group) { create(:campaign_factor_group, name: 'Communication', campaign: campaign) }

  # Create campaign factors in different groups
  let!(:innovation_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: leadership_group,
           name: 'Innovation Explorer',
           code: 'innovation_explorer',
           description: 'Measures innovation capabilities',
           output_type: :numeric)
  end

  let!(:results_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: leadership_group,
           name: 'Results Driver',
           code: 'results_driver',
           description: 'Measures results-driven behavior',
           output_type: :string)
  end

  let!(:technical_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: technical_group,
           name: 'Problem Solving',
           code: 'problem_solving',
           description: 'Measures problem-solving skills',
           output_type: :numeric)
  end

  let!(:communication_factor) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: communication_group,
           name: 'Verbal Communication',
           code: 'verbal_communication',
           description: 'Measures verbal communication skills',
           output_type: :string)
  end

  # Create campaign factor values
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

  let!(:communication_value) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: communication_factor,
           string_value: 'Excellent')
  end

  let(:campaign_factors_drop) { AI::PromptTemplate::CampaignFactorsDrop.new(campaign, user) }

  describe '#campaign_factors_by_group' do
    it 'filters campaign factors by group name' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Leadership')

      expect(result).to be_an(Array)
      expect(result.length).to eq(2)
      expect(result).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

      codes = result.map(&:code)
      expect(codes).to contain_exactly('innovation_explorer', 'results_driver')

      names = result.map(&:name)
      expect(names).to contain_exactly('Innovation Explorer', 'Results Driver')
    end

    it 'returns empty array for non-existent group' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Non-existent Group')

      expect(result).to be_an(Array)
      expect(result).to be_empty
    end

    it 'is case-sensitive for group names' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'leadership')

      expect(result).to be_empty
    end

    it 'filters Technical Skills group correctly' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Technical Skills')

      expect(result.length).to eq(1)
      expect(result.first.code).to eq('problem_solving')
      expect(result.first.name).to eq('Problem Solving')
    end

    it 'filters Communication group correctly' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Communication')

      expect(result.length).to eq(1)
      expect(result.first.code).to eq('verbal_communication')
      expect(result.first.name).to eq('Verbal Communication')
    end

    it 'preserves user context in filtered factors' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Leadership')

      result.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end

    it 'allows access to values in filtered factors' do
      result = filter_instance.campaign_factors_by_group(campaign_factors_drop, 'Leadership')

      innovation_drop = result.find { |f| f.code == 'innovation_explorer' }
      results_drop = result.find { |f| f.code == 'results_driver' }

      expect(innovation_drop.value).to eq(8.5)
      expect(results_drop.value).to eq('High')
    end
  end

  describe '#campaign_factors_by_codes' do
    context 'with comma-separated string input' do
      it 'filters campaign factors by codes string' do
        codes_string = 'innovation_explorer,problem_solving'
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

        expect(result).to be_an(Array)
        expect(result.length).to eq(2)
        expect(result).to all(be_a(AI::PromptTemplate::CampaignFactorDrop))

        returned_codes = result.map(&:code)
        expect(returned_codes).to contain_exactly('innovation_explorer', 'problem_solving')
      end

      it 'handles whitespace in codes string' do
        codes_string = ' innovation_explorer , problem_solving , verbal_communication '
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

        expect(result.length).to eq(3)
        returned_codes = result.map(&:code)
        expect(returned_codes).to contain_exactly('innovation_explorer', 'problem_solving', 'verbal_communication')
      end

      it 'handles single code string' do
        codes_string = 'innovation_explorer'
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

        expect(result.length).to eq(1)
        expect(result.first.code).to eq('innovation_explorer')
      end

      it 'handles empty string' do
        codes_string = ''
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

        expect(result).to be_empty
      end

      it 'filters out non-existent codes' do
        codes_string = 'innovation_explorer,non_existent_code,problem_solving'
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

        expect(result.length).to eq(2)
        returned_codes = result.map(&:code)
        expect(returned_codes).to contain_exactly('innovation_explorer', 'problem_solving')
      end
    end

    context 'with array input' do
      it 'filters campaign factors by codes array' do
        codes_array = %w[innovation_explorer problem_solving]
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_array)

        expect(result).to be_an(Array)
        expect(result.length).to eq(2)

        returned_codes = result.map(&:code)
        expect(returned_codes).to contain_exactly('innovation_explorer', 'problem_solving')
      end

      it 'handles empty array' do
        codes_array = []
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_array)

        expect(result).to be_empty
      end

      it 'handles single element array' do
        codes_array = ['results_driver']
        result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_array)

        expect(result.length).to eq(1)
        expect(result.first.code).to eq('results_driver')
      end
    end

    it 'preserves user context in filtered factors' do
      codes_string = 'innovation_explorer,results_driver'
      result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

      result.each do |factor_drop|
        expect(factor_drop.instance_variable_get(:@user)).to eq(user)
      end
    end

    it 'allows access to values in filtered factors' do
      codes_string = 'innovation_explorer,results_driver'
      result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

      innovation_drop = result.find { |f| f.code == 'innovation_explorer' }
      results_drop = result.find { |f| f.code == 'results_driver' }

      expect(innovation_drop.value).to eq(8.5)
      expect(results_drop.value).to eq('High')
    end

    it 'handles all codes' do
      codes_string = 'innovation_explorer,results_driver,problem_solving,verbal_communication'
      result = filter_instance.campaign_factors_by_codes(campaign_factors_drop, codes_string)

      expect(result.length).to eq(4)
      returned_codes = result.map(&:code)
      expect(returned_codes).to contain_exactly('innovation_explorer', 'results_driver', 'problem_solving',
                                                'verbal_communication')
    end
  end
end
