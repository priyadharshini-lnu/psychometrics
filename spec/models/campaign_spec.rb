# frozen_string_literal: true

require 'rails_helper'

describe Campaign, type: :model do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }

  describe '#datasheet_columns' do
    it 'returns campaign datasheet columns if there is not project datasheet' do
      datasheet = create(:datasheet, campaign: campaign)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' }])
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      datasheet = create(:datasheet, project: project)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' }])
    end

    it 'returns combined datasheet columns' do
      c_datasheet = create(:datasheet, campaign: campaign)
      p_datasheet = create(:datasheet, project: project)
      create(:sheet_column, name: 'Title', column_type: 'text', sheet: c_datasheet)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'String' },
                                                { 'name' => 'Title', 'type' => 'Text' }])
    end

    it 'returns combined datasheet columns with different types' do
      c_datasheet = create(:datasheet, campaign: campaign)
      p_datasheet = create(:datasheet, project: project)
      create(:sheet_column, name: 'Name', column_type: 'text', sheet: c_datasheet)
      create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      expect(campaign.datasheet_columns).to eq([{ 'name' => 'Name', 'type' => 'Text' }])
    end
  end

  describe '#datasheet_column_records' do
    it 'returns campaign datasheet column records when no project datasheet exists' do
      datasheet = create(:datasheet, campaign: campaign)
      column = create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      records = campaign.datasheet_column_records
      expect(records).to have_attributes(length: 1)
      expect(records.first).to eq(column)
    end

    it 'returns project datasheet column records when no campaign datasheet exists' do
      datasheet = create(:datasheet, project: project)
      column = create(:sheet_column, name: 'Name', column_type: 'string', sheet: datasheet)

      records = campaign.datasheet_column_records
      expect(records).to have_attributes(length: 1)
      expect(records.first).to eq(column)
    end

    it 'returns combined datasheet column records from both project and campaign' do
      c_datasheet = create(:datasheet, campaign: campaign)
      p_datasheet = create(:datasheet, project: project)
      campaign_column = create(:sheet_column, name: 'Title', column_type: 'text', sheet: c_datasheet)
      project_column = create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      records = campaign.datasheet_column_records
      expect(records).to have_attributes(length: 2)
      expect(records).to include(project_column, campaign_column)
    end

    it 'prioritizes campaign column over project column when names are the same' do
      c_datasheet = create(:datasheet, campaign: campaign)
      p_datasheet = create(:datasheet, project: project)
      campaign_column = create(:sheet_column, name: 'Name', column_type: 'text', sheet: c_datasheet)
      project_column = create(:sheet_column, name: 'Name', column_type: 'string', sheet: p_datasheet)

      records = campaign.datasheet_column_records
      expect(records).to have_attributes(length: 1)
      expect(records.first).to eq(campaign_column)
      expect(records.first).not_to eq(project_column)
    end

    it 'returns empty array when no datasheets exist' do
      records = campaign.datasheet_column_records
      expect(records).to eq([])
    end
  end

  describe '#datasheet_column_names' do
    it 'return keys for datasheet_columns' do
      allow(campaign).to receive(:datasheet_columns).and_return([{ 'name' => 'Name', 'type' => 'String' },
                                                                 { 'name' => 'Title', 'type' => 'Text' }])

      expect(campaign.datasheet_column_names).to eq(%w[Name Title])
    end
  end

  describe '#datasheet_data' do
    let(:campaign_datasheet) { create(:datasheet, campaign: campaign) }
    let(:project_datasheet) { create(:datasheet, project: project) }

    it 'returns campaign datasheet columns if there is not project datasheet' do
      col = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      r1 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)
      r2 = create(:sheet_row, email: 'smith@cc.com', sheet: campaign_datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col, value: 'James')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: col, value: 'Smith')
      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'return project datsheet columns if there is no campaign datasheet' do
      col = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col, value: 'James')

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'James' })
    end

    it 'returns combined datasheet columns' do
      col_name1 = create(:sheet_column, name: 'Name', column_type: 'string', sheet: project_datasheet)
      col_name2 = create(:sheet_column, name: 'Name', column_type: 'string', sheet: campaign_datasheet)
      col_id = create(:sheet_column, sheet: project_datasheet, name: 'Id', column_type: 'number')
      col_title = create(:sheet_column, sheet: campaign_datasheet, name: 'Title', column_type: 'string')

      r1 = create(:sheet_row, email: 'james@cc.com', sheet: project_datasheet)
      r2 = create(:sheet_row, email: 'james@cc.com', sheet: campaign_datasheet)

      create(:sheet_row_datum, sheet_row: r1, sheet_column: col_name1, string_value: 'James')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: col_id, numeric_value: 1)

      create(:sheet_row_datum, sheet_row: r2, sheet_column: col_name2, string_value: 'Smith')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: col_title, string_value: 'Developer')

      expect(campaign.datasheet_data('james@cc.com')).to eq({ 'Name' => 'Smith', 'Id' => 1, 'Title' => 'Developer' })
    end
  end

  describe '#disable_webhooks?' do
    it 'returns false by default' do
      expect(campaign.disable_webhooks?).to be false
    end

    it 'delegates to campaign_options' do
      campaign.campaign_options.update!(disable_webhooks: true)

      expect(campaign.disable_webhooks?).to be true
    end
  end

  describe 'system check option helpers' do
    context 'for common campaigns' do
      describe '#system_check_enabled?' do
        it 'returns false by default' do
          expect(campaign.system_check_enabled?).to be false
        end

        it 'returns true when enabled in campaign_options' do
          campaign.campaign_options.update!(system_check_enabled: true)

          expect(campaign.system_check_enabled?).to be true
        end
      end

      describe '#system_check_validity' do
        it 'returns 86400 by default' do
          expect(campaign.system_check_validity).to eq(86_400)
        end

        it 'returns the configured validity period' do
          campaign.campaign_options.update!(system_check_validity: 3600)

          expect(campaign.system_check_validity).to eq(3600)
        end
      end

      describe '#allow_continue_with_warning?' do
        it 'returns false by default' do
          expect(campaign.allow_continue_with_warning?).to be false
        end

        it 'returns true when enabled in campaign_options' do
          campaign.campaign_options.update!(allow_continue_with_warning: true)

          expect(campaign.allow_continue_with_warning?).to be true
        end
      end

      describe '#skip_assessment_level_checks?' do
        it 'returns true by default' do
          expect(campaign.skip_assessment_level_checks?).to be true
        end

        it 'returns false when disabled in campaign_options' do
          campaign.campaign_options.update!(skip_assessment_level_checks: false)

          expect(campaign.skip_assessment_level_checks?).to be false
        end
      end

      describe '#should_run_assessment_level_checks?' do
        it 'returns true when campaign-level system checks are disabled' do
          expect(campaign.should_run_assessment_level_checks?).to be true
        end

        it 'returns false when campaign-level system checks are enabled and assessment-level checks are skipped' do
          campaign.campaign_options.update!(system_check_enabled: true, skip_assessment_level_checks: true)

          expect(campaign.should_run_assessment_level_checks?).to be false
        end

        it 'returns true when campaign-level system checks are enabled and assessment-level checks are not skipped' do
          campaign.campaign_options.update!(system_check_enabled: true, skip_assessment_level_checks: false)

          expect(campaign.should_run_assessment_level_checks?).to be true
        end
      end

      describe '#minimum_upload_speed' do
        it 'returns nil when not configured' do
          expect(campaign.minimum_upload_speed).to be_nil
        end

        it 'returns the configured minimum upload speed when set' do
          campaign.campaign_options.update!(minimum_upload_speed: 25)

          expect(campaign.minimum_upload_speed).to eq(25)
        end
      end

      describe '#minimum_download_speed' do
        it 'returns nil when not configured' do
          expect(campaign.minimum_download_speed).to be_nil
        end

        it 'returns the configured minimum download speed when set' do
          campaign.campaign_options.update!(minimum_download_speed: 50)

          expect(campaign.minimum_download_speed).to eq(50)
        end
      end

      describe '#calculated_minimum_upload_speed' do
        it 'returns base upload speed when no relevant questions' do
          expect(campaign.calculated_minimum_upload_speed).to eq(1)
        end

        it 'returns video upload speed when campaign has video questions' do
          user = create(:user)
          campaign_user = create(:campaign_user, campaign: campaign, user: user)
          assessment = create(:assessment)
          create(:campaign_assessment, campaign: campaign, assessment: assessment)
          create(:user_assessment, campaign: campaign, assessment: assessment, subject: user)
          create(:question, assessment: assessment, type: 'VideoResponse')

          expect(campaign.calculated_minimum_upload_speed(campaign_user)).to eq(5)
        end
      end
    end

    context 'for 360 campaigns' do
      let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
      let(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }

      before do
        threesixty_option
        campaign.reload
      end

      describe '#system_check_enabled?' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'system_check_enabled' => true } })

          expect(campaign.system_check_enabled?).to be true
        end

        it 'returns default value when not set in threesixty_option (does not fallback to campaign_options)' do
          expect(campaign.system_check_enabled?).to be false
        end
      end

      describe '#system_check_validity' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'system_check_validity' => 7200 } })

          expect(campaign.system_check_validity).to eq(7200)
        end

        it 'returns default (86400) when not set in threesixty_option' do
          expect(campaign.system_check_validity).to eq(86_400)
        end
      end

      describe '#allow_continue_with_warning?' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'allow_continue_with_warning' => true } })

          expect(campaign.allow_continue_with_warning?).to be true
        end

        it 'returns default value when not set in threesixty_option (does not fallback to campaign_options)' do
          expect(campaign.allow_continue_with_warning?).to be false
        end
      end

      describe '#skip_assessment_level_checks?' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'skip_assessment_level_checks' => false } })

          expect(campaign.skip_assessment_level_checks?).to be false
        end

        it 'returns default value when not set in threesixty_option' do
          expect(campaign.skip_assessment_level_checks?).to be true
        end
      end

      describe '#should_run_assessment_level_checks?' do
        it 'returns false when campaign-level system checks are enabled and assessment-level checks are skipped' do
          threesixty_option.update!(participants: { 'global' => { 'system_check_enabled' => true,
                                                                  'skip_assessment_level_checks' => true } })

          expect(campaign.should_run_assessment_level_checks?).to be false
        end

        it 'returns true when campaign-level system checks are enabled and assessment-level checks are not skipped' do
          threesixty_option.update!(participants: { 'global' => { 'system_check_enabled' => true,
                                                                  'skip_assessment_level_checks' => false } })

          expect(campaign.should_run_assessment_level_checks?).to be true
        end

        it 'returns true when campaign-level system checks are disabled' do
          expect(campaign.should_run_assessment_level_checks?).to be true
        end
      end

      describe '#minimum_upload_speed' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'minimum_upload_speed' => 30 } })

          expect(campaign.minimum_upload_speed).to eq(30)
        end

        it 'returns nil when not set in threesixty_option' do
          expect(campaign.minimum_upload_speed).to be_nil
        end
      end

      describe '#minimum_download_speed' do
        it 'returns value from threesixty_option participants global when set' do
          threesixty_option.update!(participants: { 'global' => { 'minimum_download_speed' => 100 } })

          expect(campaign.minimum_download_speed).to eq(100)
        end

        it 'returns nil when not set in threesixty_option' do
          expect(campaign.minimum_download_speed).to be_nil
        end
      end
    end
  end

  describe 'tagging' do
    let!(:superadmin) { create(:superadmin) }

    before do
      set_current_user(superadmin)
    end

    it 'can be tagged' do
      campaign.add_tag('important')
      campaign.save
      expect(campaign.reload.all_tags_list).to include('important')
    end

    it 'can remove a tag' do
      campaign.add_tag('removable')
      campaign.save
      campaign.reload

      campaign.remove_tag('removable')
      expect(campaign.reload.all_tags_list).not_to include('removable')
    end

    it 'scopes tags by client_id' do
      campaign.add_tag('scoped-tag')
      campaign.save
      expect(campaign.taggings.last.tenant).to eq(campaign.client_id.to_s)
    end
  end
end
