# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportCampaignTranslationsJob do
  let(:project) { create(:project, name: 'Project Alpha') }
  let(:record) { create(:admin_job_record, operation: :export_campaign_translations, data: { project_id: project.id }) }
  let!(:active_campaign) { create(:campaign, project: project, status: :active, name: 'English Name') }
  let!(:inactive_campaign) { create(:campaign, project: project, status: :inactive, name: 'Inactive Name') }
  let(:english_header) { [I18n.t('languages.en'), 'en'].join(' / ') }
  let(:spanish_header) { [I18n.t('languages.es'), 'es'].join(' / ') }

  before do
    Mobility.with_locale(:es) { active_campaign.update!(name: 'Nombre Español') }
  end

  describe '#headers' do
    it 'starts with campaign id and all locale headers including english' do
      headers = described_class.new(record).headers

      expect(headers.first).to eq('Campaign ID')
      expect(headers).to include(english_header)
      expect(headers).to include(spanish_header)
    end
  end

  describe '#records_for_export' do
    it 'includes only active campaigns' do
      records = described_class.new(record).records_for_export

      expect(records).to include(active_campaign)
      expect(records).not_to include(inactive_campaign)
    end
  end

  describe '#data_row' do
    it 'exports english and translated values in locale columns' do
      row = described_class.new(record).data_row(active_campaign)
      headers = described_class.new(record).headers

      expect(row[0]).to eq(active_campaign.id)
      expect(row[headers.index(english_header)]).to eq('English Name')
      expect(row[headers.index(spanish_header)]).to eq('Nombre Español')
    end
  end

  describe '#file_name' do
    it 'uses csv file extension' do
      expect(described_class.new(record).file_name).to eq('Project Alpha-campaign-name-translations-template.csv')
    end
  end
end
