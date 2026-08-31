# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportCampaignTranslations do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }

  def attached_csv(content)
    file = Tempfile.new(['campaign-translations', '.csv'])
    file.write(content)
    file.rewind

    record = create(:admin_job_record, operation: :import_campaign_translations, data: { project_id: project.id })
    record.file.attach(io: file, filename: 'campaign-translations.csv', content_type: 'text/csv')
    record.file
  end

  describe '#call' do
    it 'updates english and translated campaign names from locale columns' do
      csv = <<~CSV
        Campaign ID,English / en,Spanish / es
        #{campaign.id},Updated English,Nombre Español
      CSV

      result = described_class.new(attached_csv(csv), project.id).call

      expect(result).to eq(true)

      Mobility.with_locale(:en) do
        campaign.reload
        expect(campaign.name).to eq('Updated English')
      end

      Mobility.with_locale(:es) do
        campaign.reload
        expect(campaign.name).to eq('Nombre Español')
      end
    end

    it 'updates non-english locales when english header is omitted' do
      csv = <<~CSV
        Campaign ID,Spanish / es
        #{campaign.id},Nombre Español
      CSV

      result = described_class.new(attached_csv(csv), project.id).call

      expect(result).to eq(true)

      Mobility.with_locale(:es) do
        campaign.reload
        expect(campaign.name).to eq('Nombre Español')
      end
    end

    it 'succeeds when all translation cells are blank' do
      csv = <<~CSV
        Campaign ID,English / en,Spanish / es
        #{campaign.id},,
      CSV

      expect(described_class.new(attached_csv(csv), project.id).call).to eq(true)
    end

    it 'ignores blank values for some locales' do
      original_name = nil

      Mobility.with_locale(:es) do
        campaign.reload
        original_name = campaign.name
      end

      csv = <<~CSV
        Campaign ID,English / en,Spanish / es
        #{campaign.id},Updated English,
      CSV

      expect(described_class.new(attached_csv(csv), project.id).call).to eq(true)

      Mobility.with_locale(:en) do
        campaign.reload
        expect(campaign.name).to eq('Updated English')
      end

      Mobility.with_locale(:es) do
        campaign.reload
        expect(campaign.name).to eq(original_name)
      end
    end

    it 'raises error when campaign is not in project' do
      csv = <<~CSV
        Campaign ID,English / en
        999999,Updated English
      CSV

      expect do
        described_class.new(attached_csv(csv), project.id).call
      end.to raise_error(
        Errors::ImportError,
        'Row 2: Campaign 999999 was not found in this project'
      )
    end
  end
end
