# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Copy::CampaignAIArtifacts do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:new_campaign) { create(:campaign, project: project) }
  let(:ai_assistant) { create(:assistant) }

  let!(:artifact) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           name: 'Test Artifact',
           code: 'test_artifact',
           instructions: 'Some instructions',
           include_all_datasheet_columns: true)
  end

  subject(:copy) { described_class.call!(campaign, new_campaign) }

  it 'copies all artifacts to the new campaign' do
    expect { copy }.to change { new_campaign.campaign_ai_artifacts.count }.by(1)
  end

  it 'copies artifact attributes' do
    copy
    new_artifact = new_campaign.campaign_ai_artifacts.first
    expect(new_artifact.name).to eq artifact.name
    expect(new_artifact.code).to eq artifact.code
    expect(new_artifact.instructions).to eq artifact.instructions
    expect(new_artifact.include_all_datasheet_columns).to eq artifact.include_all_datasheet_columns
    expect(new_artifact.ai_assistant_id).to eq artifact.ai_assistant_id
  end

  it 'creates a distinct artifact record (not the same record)' do
    copy
    expect(new_campaign.campaign_ai_artifacts.first.id).not_to eq artifact.id
  end

  context 'with dependencies' do
    let(:question) { create(:question) }
    let(:datasheet) { create(:datasheet, campaign: new_campaign) }
    let(:new_sheet_column) { create(:sheet_column, sheet: datasheet, name: 'score') }

    let(:original_datasheet) { create(:datasheet, campaign: campaign) }
    let!(:original_sheet_column) { create(:sheet_column, sheet: original_datasheet, name: 'score') }

    let(:campaign_factor) do
      create(:campaign_factor, campaign: campaign, code: 'leadership')
    end
    let!(:new_campaign_factor) { create(:campaign_factor, campaign: new_campaign, code: 'leadership') }

    before do
      artifact.dependencies.create!(dependency: question)
      artifact.dependencies.create!(dependency: campaign_factor)
      artifact.dependencies.create!(dependency: original_sheet_column)
      new_sheet_column # ensure it exists
    end

    it 'copies question dependencies' do
      copy
      new_artifact = new_campaign.campaign_ai_artifacts.first
      expect(new_artifact.questions).to include(question)
    end

    it 'copies campaign factor dependencies by matching code in the new campaign' do
      copy
      new_artifact = new_campaign.campaign_ai_artifacts.first
      expect(new_artifact.campaign_factors).to include(new_campaign_factor)
    end

    it 'copies sheet column dependencies by matching name in the new campaign' do
      copy
      new_artifact = new_campaign.campaign_ai_artifacts.first
      expect(new_artifact.sheet_columns).to include(new_sheet_column)
    end

    it 'skips campaign factor dependency when no matching factor exists in the new campaign' do
      new_campaign_factor.destroy!
      expect { copy }.not_to raise_error
      new_artifact = new_campaign.campaign_ai_artifacts.first
      expect(new_artifact.campaign_factors).to be_empty
    end

    it 'skips sheet column dependency when no matching column exists in the new campaign' do
      new_sheet_column.destroy!
      expect { copy }.not_to raise_error
      new_artifact = new_campaign.campaign_ai_artifacts.first
      expect(new_artifact.sheet_columns).to be_empty
    end
  end
end
