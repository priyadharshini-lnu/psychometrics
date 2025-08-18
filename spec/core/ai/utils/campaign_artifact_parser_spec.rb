# frozen_string_literal: true

require 'rails_helper'

describe AI::Utils::CampaignArtifactParser do
  subject { described_class.new(campaign_assistant_artifact, user).call! }

  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant, dependencies: dependencies) }
  let(:campaign_assistant_artifact) do
    create(:campaign_ai_artifact,
           campaign: campaign,
           ai_assistant: ai_assistant,
           instructions: instructions,
           include_all_datasheet_columns: include_all_datasheet_columns,
           datasheet_columns: datasheet_columns,
           campaign_factors: campaign_factor_codes)
  end

  let(:instructions) { 'Generate a comprehensive report based on user data' }
  let(:dependencies) { [] }
  let(:include_all_datasheet_columns) { false }
  let(:datasheet_columns) { [] }
  let(:campaign_factor_codes) { [] }

  describe '.call!' do
    context 'when no dependencies are configured' do
      it 'returns only campaign instructions' do
        result = subject

        expect(result).to include('<campaign_instructions>')
        expect(result).to include(instructions)
        expect(result).to include('</campaign_instructions>')
        expect(result).not_to include('<datasheet>')
        expect(result).not_to include('<campaign_factors>')
        expect(result).not_to include('<assessments>')
      end
    end

    context 'with datasheet dependency' do
      let(:dependencies) { ['datasheet'] }
      let(:datasheet_columns) { %w[name department] }
      let!(:datasheet) { create(:datasheet, campaign: campaign) }

      context 'when campaign has no datasheet configured' do
        let(:datasheet) { nil }

        it 'raises DependencyNotConfiguredError' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.no_datasheet_configured')
            )
          end
        end
      end

      context 'when user is not found in datasheet' do
        it 'raises DependencyNotConfiguredError' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.user_not_found_in_datasheet')
            )
          end
        end
      end

      context 'when specific columns are requested but not configured' do
        let(:datasheet_columns) { [] }

        it 'raises DependencyNotConfiguredError' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include('Error:')
            expect(error.message).to include("Dependency 'datasheet' has the following issues:")
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.user_not_found_in_datasheet')
            )
          end
        end
      end

      context 'when user has empty column values' do
        let!(:datasheet_row) { create(:sheet_row, sheet: datasheet, email: user.email) }
        let!(:sheet_columns) do
          [
            create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string'),
            create(:sheet_column, sheet: datasheet, name: 'department', column_type: 'string')
          ]
        end
        let!(:empty_row_data) do
          [
            create(:sheet_row_datum, sheet_row: datasheet_row, sheet_column: sheet_columns[0], string_value: ''),
            create(:sheet_row_datum, sheet_row: datasheet_row, sheet_column: sheet_columns[1], string_value: nil)
          ]
        end

        it 'raises DependencyValueMissingError with missing value details' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t(
                'administration.ai_assistants.artifacts.parsers.datasheet.column_no_value',
                column: 'name',
                email: user.email
              )
            )
            expect(error.message).to include(
              I18n.t(
                'administration.ai_assistants.artifacts.parsers.datasheet.column_no_value',
                column: 'department',
                email: user.email
              )
            )
          end
        end
      end

      context 'when all conditions are met' do
        let!(:sheet_columns) do
          [
            create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string'),
            create(:sheet_column, sheet: datasheet, name: 'department', column_type: 'string')
          ]
        end
        let!(:datasheet_row) { create(:sheet_row, sheet: datasheet, email: user.email) }
        let!(:row_data) do
          [
            create(:sheet_row_datum, sheet_row: datasheet_row, sheet_column: sheet_columns[0],
              string_value: 'John Doe'),
            create(:sheet_row_datum, sheet_row: datasheet_row, sheet_column: sheet_columns[1],
              string_value: 'Engineering')
          ]
        end

        it 'returns formatted datasheet data' do
          result = subject

          expect(result).to include('<datasheet>')
          expect(result).to include('John Doe')
          expect(result).to include('Engineering')
          expect(result).to include('</datasheet>')
        end
      end
    end

    context 'with campaign_factors dependency' do
      let(:dependencies) { ['campaign_factors'] }
      let(:campaign_factor_codes) { %w[leadership_score communication_rating] }
      let!(:leadership_factor) do
        create(:campaign_factor,
               campaign: campaign,
               code: 'leadership_score',
               name: 'Leadership Score',
               output_type: 'numeric')
      end
      let!(:communication_factor) do
        create(:campaign_factor,
               campaign: campaign,
               code: 'communication_rating',
               name: 'Communication Rating',
               output_type: 'string')
      end

      context 'when no campaign factors are configured' do
        let(:campaign_factor_codes) { [] }

        it 'raises DependencyNotConfiguredError' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.no_campaign_factors_configured')
            )
          end
        end
      end

      context 'when requested factors do not exist in campaign' do
        let(:campaign_factor_codes) { [] }
        let!(:other_campaign) { create(:campaign) }
        let!(:nonexistent_factor) do
          create(:campaign_factor,
                 campaign: other_campaign, # Create in different campaign
                 code: 'nonexistent_factor',
                 name: 'Nonexistent Factor',
                 output_type: 'numeric')
        end

        before do
          campaign_assistant_artifact.dependencies.create!(dependency: nonexistent_factor)
        end

        it 'raises DependencyValueMissingError for factor from different campaign' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_no_value',
                     code: 'nonexistent_factor', name: 'Nonexistent Factor', email: user.email)
            )
          end
        end
      end

      context 'when user has no values assigned for factors' do
        it 'raises DependencyValueMissingError with factor details' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_no_value',
                     code: 'leadership_score', name: 'Leadership Score', email: user.email)
            )
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_no_value',
                     code: 'communication_rating', name: 'Communication Rating', email: user.email)
            )
          end
        end
      end

      context 'when user has empty values for factors' do
        let!(:leadership_value) do
          create(:campaign_factor_value,
                 campaign_factor: leadership_factor,
                 user: user,
                 campaign: campaign,
                 numeric_value: nil)
        end
        let!(:communication_value) do
          create(:campaign_factor_value,
                 campaign_factor: communication_factor,
                 user: user,
                 campaign: campaign,
                 string_value: '')
        end

        it 'raises DependencyValueMissingError with empty value details' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_empty_value',
                     code: 'leadership_score', name: 'Leadership Score', email: user.email)
            )
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_empty_value',
                     code: 'communication_rating', name: 'Communication Rating', email: user.email)
            )
          end
        end
      end

      context 'when all conditions are met' do
        let!(:leadership_value) do
          create(:campaign_factor_value,
                 campaign_factor: leadership_factor,
                 user: user,
                 campaign: campaign,
                 numeric_value: 85)
        end
        let!(:communication_value) do
          create(:campaign_factor_value,
                 campaign_factor: communication_factor,
                 user: user,
                 campaign: campaign,
                 string_value: 'Excellent')
        end

        it 'returns formatted campaign factors data' do
          result = subject

          expect(result).to include('<campaign_factors>')
          expect(result).to include('<campaign_factor>')
          expect(result).to include('<name>Leadership Score</name>')
          expect(result).to include('<code>leadership_score</code>')
          expect(result).to include('<output_type>numeric</output_type>')
          expect(result).to include('<value>85.0</value>')
          expect(result).to include('<name>Communication Rating</name>')
          expect(result).to include('<code>communication_rating</code>')
          expect(result).to include('<value>Excellent</value>')
          expect(result).to include('</campaign_factors>')
        end
      end
    end

    context 'with unknown dependency' do
      let(:dependencies) { ['unknown_dependency'] }

      it 'raises DependencyNotConfiguredError' do
        expect { subject }.to raise_error(StandardError) do |error|
          expect(error.message).to include(
            'Validation failed: Dependencies contains invalid entry(ies): unknown_dependency'
          )
        end
      end
    end

    context 'with multiple dependencies having errors' do
      let(:dependencies) { %w[datasheet campaign_factors] }
      let(:datasheet_columns) { [] }
      let(:campaign_factor_codes) { [] }

      context 'when multiple dependencies have configuration issues' do
        it 'collects and reports all errors together' do
          expect { subject }.to raise_error(StandardError) do |error|
            expect(error.message).to include('Error:')
            expect(error.message).to include("Dependency 'datasheet' has the following issues:")
            expect(error.message).to include(
              I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.no_datasheet_configured')
            )
            expect(error.message).to include("Dependency 'Campaign Factors' has the following issues:")
          end
        end
      end
    end

    context 'with mixed success and failure dependencies' do
      let(:dependencies) { %w[datasheet campaign_factors] }
      let(:datasheet_columns) { ['name'] }
      let(:campaign_factor_codes) { [] }
      let!(:datasheet) { create(:datasheet, campaign: campaign) }
      let!(:datasheet_row) { create(:sheet_row, sheet: datasheet, email: user.email) }
      let!(:sheet_column) { create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string') }
      let!(:row_data) do
        create(:sheet_row_datum, sheet_row: datasheet_row, sheet_column: sheet_column, string_value: 'John Doe')
      end
      let!(:other_campaign) { create(:campaign) }
      let!(:nonexistent_factor) do
        create(:campaign_factor,
               campaign: other_campaign,
               code: 'nonexistent_factor',
               name: 'Nonexistent Factor',
               output_type: 'numeric')
      end

      before do
        # Create a dependency to a factor that exists but not in this campaign
        campaign_assistant_artifact.dependencies.create!(dependency: nonexistent_factor)
      end

      it 'includes successful dependency output and error for failed dependency' do
        expect { subject }.to raise_error(StandardError) do |error|
          expect(error.message).to include('Error:')
          expect(error.message).to include("Dependency 'Campaign Factors' has the following issues:")
          expect(error.message).to include(
            I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_no_value',
                   code: 'nonexistent_factor', name: 'Nonexistent Factor', email: user.email)
          )
        end
      end
    end

    context 'edge case: empty instructions' do
      let(:instructions) { '' }

      it 'handles empty instructions gracefully' do
        result = subject

        expect(result).to include('<campaign_instructions>')
        expect(result).to include('</campaign_instructions>')
      end
    end

    context 'edge case: nil instructions' do
      let(:instructions) { nil }

      it 'handles nil instructions gracefully' do
        result = subject

        expect(result).to include('<campaign_instructions>')
        expect(result).to include('</campaign_instructions>')
      end
    end
  end
end
