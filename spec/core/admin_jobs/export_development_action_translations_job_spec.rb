# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportDevelopmentActionTranslationsJob, type: :job do
  let(:project) { Project.find(create(:project).id) }
  let!(:development_action) do
    create(:development_action,
           owner: project,
           name: 'Test Action',
           description: 'Test Description')
  end

  # Create translations for the development action
  before do
    Mobility.with_locale(:fr) do
      development_action.update!(
        name: 'French Name',
        description: 'French Description'
      )
    end

    Mobility.with_locale(:de) do
      development_action.update!(
        name: 'German Name',
        description: 'German Description'
      )
    end
  end

  let(:record) { create(:admin_job_record, data: { 'project_id' => project.id }) }
  let(:job) { described_class.new(record) }

  describe '#headers' do
    before do
      allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
      allow(I18n).to receive(:t).with('languages.en').and_return('English')
      allow(I18n).to receive(:t).with('languages.fr').and_return('French')
      allow(I18n).to receive(:t).with('languages.de').and_return('German')
    end

    it 'returns the correct headers for the CSV' do
      expect(job.headers).to eq([
        'ID',
        'English / en',
        'French / fr',
        'German / de'
      ])
    end
  end

  describe '#data_row' do
    before do
      allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
    end

    it 'returns formatted rows of data for csv' do
      rows = job.data_row(development_action)

      expect(rows).to eq([
        ["#{development_action.id}#Name", 'Test Action', 'French Name', 'German Name'],
        ["#{development_action.id}#Description", 'Test Description', 'French Description', 'German Description']
      ])
    end

    context 'when some translations are missing' do
      before do
        development_action.translations.where(locale: 'de').delete_all
      end

      it 'returns empty strings for missing translations' do
        rows = job.data_row(development_action)

        expect(rows).to eq([
          ["#{development_action.id}#Name", 'Test Action', 'French Name', 'German Name'],
          ["#{development_action.id}#Description", 'Test Description', 'French Description', 'German Description']
        ])
      end
    end
  end

  describe '#records_for_export' do
    it 'returns development actions with translations' do
      records = job.records_for_export
      expect(records).to include(development_action)
      expect(records.first.translations.count).to eq(3) # en, fr, de
    end

    it 'orders records by id' do
      another_development_action = create(:development_action, owner: project)
      records = job.records_for_export
      expect(records.to_a).to eq([development_action, another_development_action])
    end
  end

  describe '#file_name' do
    it 'returns the correct file name with project name' do
      expect(job.file_name).to eq("#{project.name}-development-action-translations.csv")
    end

    context 'when project is not found' do
      before { allow(job).to receive(:project).and_return(nil) }

      it 'returns default file name' do
        expect(job.file_name).to eq('development-action-translations.csv')
      end
    end
  end

  describe '#generate_details' do
    it 'returns an array with file link' do
      allow(job).to receive(:file_link).and_return('link_to_file')
      expect(job.generate_details).to eq([%w[Details link_to_file]])
    end
  end

  describe '#call' do
    it 'exports translations and attaches file' do
      expect { job.call }.to broadcast(:ok)
      expect(record.file).to be_attached
      expect(record.file.content_type).to eq('text/csv')
    end

    it 'generates correct CSV content' do
      job.call
      content = record.file.download
      csv = CSV.parse(content, headers: true)

      expect(csv.headers.count).to eq(I18n.available_locales.count + 1)

      csv.find { |row| row['ID'] == "#{development_action.id}#Name" }
      csv.find { |row| row['ID'] == "#{development_action.id}#Description" }
    end
  end
end
