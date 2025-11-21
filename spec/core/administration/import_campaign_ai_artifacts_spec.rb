# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportCampaignAIArtifacts do
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant) }
  let(:csv_content) do
    <<~CSV
      Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
      artifact_1,Test Artifact,#{ai_assistant.id},Test instructions,[],[],[],false,,,
      artifact_2,Another Artifact,#{ai_assistant.id},More instructions,[],[],[],true,,,
    CSV
  end
  let(:file) do
    tempfile = Tempfile.new(['test', '.csv'])
    tempfile.write(csv_content)
    tempfile.rewind
    Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
  end

  describe '#call' do
    context 'with valid CSV data' do
      it 'imports artifacts successfully' do
        expect do
          described_class.new(file, campaign.id).call
        end.to change { AI::CampaignArtifact.count }.by(2)
      end

      it 'sets correct attributes' do
        described_class.new(file, campaign.id).call

        artifact = AI::CampaignArtifact.find_by(code: 'artifact_1')
        expect(artifact).to be_present
        expect(artifact.name).to eq('Test Artifact')
        expect(artifact.ai_assistant_id).to eq(ai_assistant.id)
        expect(artifact.instructions).to eq('Test instructions')
        expect(artifact.campaign_id).to eq(campaign.id)
      end

      it 'handles boolean fields correctly' do
        described_class.new(file, campaign.id).call

        artifact1 = AI::CampaignArtifact.find_by(code: 'artifact_1')
        artifact2 = AI::CampaignArtifact.find_by(code: 'artifact_2')

        expect(artifact1.include_all_datasheet_columns).to be false
        expect(artifact2.include_all_datasheet_columns).to be true
      end
    end

    context 'with dependencies' do
      let!(:question) { create(:question) }
      let!(:campaign_factor) { create(:campaign_factor, campaign: campaign, code: 'test_factor_code') }
      let!(:sheet) { create(:sheet, campaign: campaign) }
      let!(:sheet_column) { create(:sheet_column, sheet: sheet, name: 'test_column_name') }
      let(:csv_with_dependencies) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,#{ai_assistant.id},Test,[],[],[],false,#{question.id},test_factor_code,test_column_name
        CSV
      end
      let(:file_with_deps) do
        tempfile = Tempfile.new(['test_deps', '.csv'])
        tempfile.write(csv_with_dependencies)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'creates dependencies' do
        described_class.new(file_with_deps, campaign.id).call

        artifact = AI::CampaignArtifact.find_by(code: 'artifact_1')
        expect(artifact.dependencies.count).to eq(3)
        expect(artifact.questions).to include(question)
        expect(artifact.campaign_factors).to include(campaign_factor)
        expect(artifact.sheet_columns).to include(sheet_column)
      end
    end

    context 'with existing artifact' do
      let!(:existing_artifact) do
        create(:campaign_ai_artifact,
               campaign: campaign,
               ai_assistant: ai_assistant,
               code: 'artifact_1',
               name: 'Old Name')
      end

      let(:update_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test Artifact,#{ai_assistant.id},Test instructions,[],[],[],false,,,
        CSV
      end

      let(:update_file) do
        tempfile = Tempfile.new(['update', '.csv'])
        tempfile.write(update_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'updates existing artifact' do
        expect do
          described_class.new(update_file, campaign.id).call
        end.not_to(change { AI::CampaignArtifact.count })

        existing_artifact.reload
        expect(existing_artifact.name).to eq('Test Artifact')
      end
    end

    context 'with invalid AI assistant' do
      let(:invalid_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,99999,Test,[],[],[],false,,,
        CSV
      end
      let(:invalid_file) do
        tempfile = Tempfile.new(['invalid', '.csv'])
        tempfile.write(invalid_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'raises an error' do
        expect do
          described_class.new(invalid_file, campaign.id).call
        end.to raise_error(Errors::ImportError, /AI Assistant not found/)
      end
    end

    context 'with invalid dependency' do
      let(:invalid_deps_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,#{ai_assistant.id},Test,[],[],[],false,99999,,
        CSV
      end
      let(:invalid_deps_file) do
        tempfile = Tempfile.new(['invalid_deps', '.csv'])
        tempfile.write(invalid_deps_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'raises an error for invalid question dependency' do
        expect do
          described_class.new(invalid_deps_file, campaign.id).call
        end.to raise_error(Errors::ImportError, /Dependency.*not found/)
      end
    end

    context 'with invalid campaign factor code' do
      let(:invalid_factor_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,#{ai_assistant.id},Test,[],[],[],false,,invalid_factor_code,
        CSV
      end
      let(:invalid_factor_file) do
        tempfile = Tempfile.new(['invalid_factor', '.csv'])
        tempfile.write(invalid_factor_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'raises an error for invalid campaign factor code' do
        expect do
          described_class.new(invalid_factor_file, campaign.id).call
        end.to raise_error(Errors::ImportError, /Campaign factor.*not found/)
      end
    end

    context 'with invalid sheet column name' do
      let(:invalid_column_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,#{ai_assistant.id},Test,[],[],[],false,,,invalid_column_name
        CSV
      end
      let(:invalid_column_file) do
        tempfile = Tempfile.new(['invalid_column', '.csv'])
        tempfile.write(invalid_column_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'raises an error for invalid sheet column name' do
        expect do
          described_class.new(invalid_column_file, campaign.id).call
        end.to raise_error(Errors::ImportError, /Sheet column.*not found/)
      end
    end

    context 'with project-level sheet column' do
      let!(:project_sheet) { create(:sheet, project: campaign.project) }
      let!(:project_column) { create(:sheet_column, sheet: project_sheet, name: 'project_column') }
      let(:project_column_csv) do
        <<~CSV
          Code,Name,AIAssistantID,Instructions,Assessments,CampaignFactors,DatasheetColumns,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorCodes,DependencySheetColumnNames
          artifact_1,Test,#{ai_assistant.id},Test,[],[],[],false,,,project_column
        CSV
      end
      let(:project_column_file) do
        tempfile = Tempfile.new(['project_column', '.csv'])
        tempfile.write(project_column_csv)
        tempfile.rewind
        Rack::Test::UploadedFile.new(tempfile.path, 'text/csv', original_filename: 'test.csv')
      end

      it 'finds project-level sheet columns' do
        described_class.new(project_column_file, campaign.id).call

        artifact = AI::CampaignArtifact.find_by(code: 'artifact_1')
        expect(artifact.sheet_columns).to include(project_column)
      end
    end
  end
end
