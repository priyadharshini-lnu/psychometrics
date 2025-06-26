# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JobRoles::ImportTranslations do
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

  let(:valid_csv_content) do
    <<~CSV
      ID,Locale,Name,Description
      #{job_role.id},en,Updated Name,Updated Description
      #{job_role.id},es,Nombre Actualizado,Descripción Actualizada
    CSV
  end

  let(:file_url) { 'https://example.com/translations.csv' }

  before do
    stub_request(:get, file_url).
      to_return(
        status: 200,
        headers: { 'Content-Type' => 'text/csv' },
        body: valid_csv_content
      )
  end

  describe '#call' do
    it 'updates job_role translations' do
      described_class.call!(file_url, project.id)

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

    context 'global import' do
      let(:global_job_role) { create(:job_role, project: nil) }

      let(:valid_csv_content) do
        <<~CSV
          ID,Locale,Name,Description
          #{global_job_role.id},en,Updated Global Name,Updated Global Description
        CSV
      end

      it 'updates global job_role translations' do
        described_class.call!(file_url, nil)

        I18n.with_locale(:en) do
          global_job_role.reload
          expect(global_job_role.name).to eq('Updated Global Name')
          expect(global_job_role.description).to eq('Updated Global Description')
        end
      end
    end
  end
end
