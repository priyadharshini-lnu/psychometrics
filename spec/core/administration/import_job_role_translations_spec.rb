# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportJobRoleTranslations do
  let(:superadmin) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: superadmin)
  end
  let(:project) { create(:project, client: client) }
  let(:job_role) { create(:job_role, project: project) }
  let(:file) { instance_double(ActionDispatch::Http::UploadedFile) }
  let(:valid_csv_content) do
    <<~CSV
      ID,English / en,Spanish / es,French / fr
      #{job_role.id}#Name,Updated Name,Nombre Actualizado,Nom Mis à Jour
      #{job_role.id}#Description,Updated Description,Descripción Actualizada,Description Mise à Jour
    CSV
  end

  describe '#call' do
    before do
      allow(CsvFileParser).to receive(:call!).and_return(CSV.parse(valid_csv_content, headers: true))
      allow(file).to receive(:rewind)
    end

    it 'updates job_role translations for multiple locales' do
      described_class.new(file, project.id).call

      # English translations
      I18n.with_locale(:en) do
        job_role.reload
        expect(job_role.name).to eq('Updated Name')
        expect(job_role.description).to eq('Updated Description')
      end

      # Spanish translations
      I18n.with_locale(:es) do
        job_role.reload
        expect(job_role.name).to eq('Nombre Actualizado')
        expect(job_role.description).to eq('Descripción Actualizada')
      end

      # French translations
      I18n.with_locale(:fr) do
        job_role.reload
        expect(job_role.name).to eq('Nom Mis à Jour')
        expect(job_role.description).to eq('Description Mise à Jour')
      end
    end

    context 'with missing required columns' do
      let(:valid_csv_content) do
        <<~CSV
          English / en,Spanish / es
          Updated Name,Nombre Actualizado
        CSV
      end

      it 'raises an import error' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(Errors::ImportError, /missing.*columns.*ID/i)
      end
    end

    context 'with empty translations' do
      let(:valid_csv_content) do
        <<~CSV
          ID,English / en,Spanish / es
          #{job_role.id}#Name,Updated Name,
          #{job_role.id}#Description,Updated Description,Descripción Actualizada
        CSV
      end

      it 'preserves existing translations when new ones are empty' do
        original_es_name = nil
        I18n.with_locale(:es) do
          job_role.update!(name: 'Nombre Original')
          original_es_name = job_role.name
        end

        described_class.new(file, project.id).call

        I18n.with_locale(:en) do
          job_role.reload
          expect(job_role.name).to eq('Updated Name')
          expect(job_role.description).to eq('Updated Description')
        end

        I18n.with_locale(:es) do
          job_role.reload
          expect(job_role.name).to eq(original_es_name) # Should keep existing name
          expect(job_role.description).to eq('Descripción Actualizada')
        end
      end
    end

    context 'with file download error' do
      before do
        allow(CsvFileParser).to receive(:call!).and_raise(Errors::DownloadFailedError, 'Download failed')
      end

      it 'raises an import error' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(Errors::ImportError, /Download failed/)
      end
    end

    context 'with global job roles' do
      let(:global_job_role) { create(:job_role, project: nil) }
      let(:valid_csv_content) do
        <<~CSV
          ID,English / en,Spanish / es
          #{global_job_role.id}#Name,Global Name,Nombre Global
          #{global_job_role.id}#Description,Global Description,Descripción Global
        CSV
      end

      it 'updates global job roles when project_id is nil' do
        described_class.new(file, nil).call

        I18n.with_locale(:en) do
          global_job_role.reload
          expect(global_job_role.name).to eq('Global Name')
          expect(global_job_role.description).to eq('Global Description')
        end

        I18n.with_locale(:es) do
          global_job_role.reload
          expect(global_job_role.name).to eq('Nombre Global')
          expect(global_job_role.description).to eq('Descripción Global')
        end
      end
    end

    context 'with multiple fields in a single update' do
      let(:valid_csv_content) do
        <<~CSV
          ID,English / en,Spanish / es
          #{job_role.id}#Name,Updated Name,Nombre Actualizado
          #{job_role.id}#Description,Updated Description,Descripción Actualizada
        CSV
      end

      it 'processes all fields for a job role' do
        described_class.new(file, project.id).call

        I18n.with_locale(:en) do
          job_role.reload
          expect(job_role.name).to eq('Updated Name')
          expect(job_role.description).to eq('Updated Description')
        end

        I18n.with_locale(:es) do
          job_role.reload
          expect(job_role.name).to eq('Nombre Actualizado')
          expect(job_role.description).to eq('Descripción Actualizada')
        end
      end
    end
  end
end
