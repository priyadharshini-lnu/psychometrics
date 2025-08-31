# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Campaigns::AIArtifactDependenciesUpdateUtil do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:ai_artifact) { create(:campaign_ai_artifact, campaign: campaign) }
  let!(:question1) { create(:question, assessment: assessment, name: 'Question 1', type: 'MultipleChoice') }
  let!(:question2) { create(:question, assessment: assessment, name: 'Question 2', type: 'TextEntry') }
  let!(:campaign_factor1) { create(:campaign_factor, campaign: campaign, code: 'leadership', name: 'Leadership Score') }
  let!(:campaign_factor2) do
    create(:campaign_factor, campaign: campaign, code: 'communication', name: 'Communication Rating')
  end
  let!(:datasheet) { create(:datasheet, campaign: campaign) }
  let!(:sheet_column1) { create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string') }
  let!(:sheet_column2) { create(:sheet_column, sheet: datasheet, name: 'department', column_type: 'string') }

  describe '.call' do
    context 'when dependencies_params has empty arrays' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [],
          'questions' => [],
          'sheet_columns' => []
        }
      end

      it 'removes all existing dependencies' do
        ai_artifact.dependencies.create!(dependency: question1)
        ai_artifact.dependencies.create!(dependency: campaign_factor1)
        ai_artifact.dependencies.create!(dependency: sheet_column1)

        result = described_class.call(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        # Should mark all existing dependencies for destruction
        destroy_deps = result[:ok].select { |dep| dep[:_destroy] }
        expect(destroy_deps.length).to eq(3)
        expect(destroy_deps.map { |d| [d[:dependency_type], d[:dependency_id]] }).to contain_exactly(
          ['Question', question1.id],
          ['CampaignFactor', campaign_factor1.id],
          ['SheetColumn', sheet_column1.id]
        )
      end
    end

    context 'when ai_artifact has no existing dependencies' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [{ 'id' => campaign_factor1.id }],
          'questions' => [{ 'id' => question1.id }],
          'sheet_columns' => [{ 'id' => sheet_column1.id }]
        }
      end

      it 'returns only new dependencies' do
        result = described_class.call(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        expect(result[:ok]).to contain_exactly(
          { dependency_type: 'CampaignFactor', dependency_id: campaign_factor1.id },
          { dependency_type: 'Question', dependency_id: question1.id },
          { dependency_type: 'SheetColumn', dependency_id: sheet_column1.id }
        )
      end
    end

    context 'when ai_artifact has existing dependencies' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [{ 'id' => campaign_factor2.id }],
          'questions' => [{ 'id' => question2.id }]
        }
      end

      before do
        ai_artifact.dependencies.create!(dependency: campaign_factor1)
        ai_artifact.dependencies.create!(dependency: question1)
        ai_artifact.dependencies.create!(dependency: sheet_column1)
      end

      it 'returns new dependencies and marks old ones for destruction' do
        result = described_class.call(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        new_dependencies = result[:ok].reject { |dep| dep[:_destroy] }
        destroy_dependencies = result[:ok].select { |dep| dep[:_destroy] }

        expect(new_dependencies).to contain_exactly(
          { dependency_type: 'CampaignFactor', dependency_id: campaign_factor2.id },
          { dependency_type: 'Question', dependency_id: question2.id }
        )

        expect(destroy_dependencies.length).to eq(3)
        expect(destroy_dependencies.map { |d| [d[:dependency_type], d[:dependency_id]] }).to contain_exactly(
          ['CampaignFactor', campaign_factor1.id],
          ['Question', question1.id],
          ['SheetColumn', sheet_column1.id]
        )
      end
    end

    context 'when keeping some existing dependencies and adding new ones' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [
            { 'id' => campaign_factor1.id },
            { 'id' => campaign_factor2.id }
          ],
          'questions' => [
            { 'id' => question2.id }
          ],
          'sheet_columns' => []
        }
      end

      before do
        ai_artifact.dependencies.create!(dependency: campaign_factor1)
        ai_artifact.dependencies.create!(dependency: question1)
        ai_artifact.dependencies.create!(dependency: sheet_column1)
      end

      it 'keeps existing, adds new, and removes others' do
        result = described_class.call(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        new_dependencies = result[:ok].reject { |dep| dep[:_destroy] }
        destroy_dependencies = result[:ok].select { |dep| dep[:_destroy] }

        expect(new_dependencies).to contain_exactly(
          { dependency_type: 'CampaignFactor', dependency_id: campaign_factor2.id },
          { dependency_type: 'Question', dependency_id: question2.id }
        )

        expect(destroy_dependencies.length).to eq(2)
        expect(destroy_dependencies.map { |d| [d[:dependency_type], d[:dependency_id]] }).to contain_exactly(
          ['Question', question1.id],
          ['SheetColumn', sheet_column1.id]
        )
      end
    end

    context 'when filtering out invalid data' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [
            { 'id' => campaign_factor1.id },
            { 'name' => 'test' }
          ],
          'questions' => [
            { 'id' => question1.id }
          ],
          'sheet_columns' => [
            { 'id' => sheet_column1.id },
            { 'name' => 'col' }
          ]
        }
      end

      it 'filters out invalid entries' do
        result = described_class.call(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        expect(result[:ok]).to contain_exactly(
          { dependency_type: 'CampaignFactor', dependency_id: campaign_factor1.id },
          { dependency_type: 'Question', dependency_id: question1.id },
          { dependency_type: 'SheetColumn', dependency_id: sheet_column1.id }
        )
      end
    end

    context 'when using .call! method' do
      let(:dependencies_params) do
        {
          'campaign_factors' => [{ 'id' => campaign_factor1.id }]
        }
      end

      it 'returns the result directly' do
        result = described_class.call!(ai_artifact: ai_artifact, dependencies_params: dependencies_params)

        expect(result).to contain_exactly(
          { dependency_type: 'CampaignFactor', dependency_id: campaign_factor1.id }
        )
      end
    end
  end
end
