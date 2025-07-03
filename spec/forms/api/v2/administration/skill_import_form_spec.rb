# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillImportForm do
  let(:form) { described_class.new }
  let(:valid_csv_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/skills.csv'),
      'text/csv'
    )
  end
  let(:invalid_format_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/invalid.txt'),
      'text/plain'
    )
  end
  let(:invalid_csv_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/invalid_skills.csv'),
      'text/csv'
    )
  end

  describe 'validations' do
    context 'when file is not present' do
      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:file]).to include("can't be blank")
      end
    end

    context 'when file has invalid format' do
      before do
        form.file = invalid_format_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:file]).to include(
          I18n.t('administration.errors.csv_file_required')
        )
      end
    end

    context 'when CSV file is missing required columns' do
      before do
        form.file = invalid_csv_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t(
            'administration.skills.import.errors.missing_columns',
            fields: 'ID, Name, Description'
          )
        )
      end
    end

    context 'when CSV file has malformed content' do
      before do
        allow(CSVSafe).to receive(:read).and_raise(CSV::MalformedCSVError.new('Invalid CSV format', 1))
        form.file = valid_csv_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include('Invalid CSV format: Invalid CSV format in line 1.')
      end
    end

    context 'when file is valid' do
      before do
        allow(CSVSafe).to receive(:read).and_return([described_class::REQUIRED_FIELDS])
        form.file = valid_csv_file
      end

      it 'is valid' do
        expect(form).to be_valid
      end
    end
  end

  describe '#processed_file' do
    context 'when form is valid' do
      before do
        allow(CSVSafe).to receive(:read).and_return([described_class::REQUIRED_FIELDS])
        form.file = valid_csv_file
      end

      it 'returns the file' do
        expect(form.file).to eq(valid_csv_file)
      end
    end

    context 'missing required fields' do
      before do
        form.file = valid_csv_file
        allow(File).to receive(:read).with(valid_csv_file, encoding: 'bom|utf-8').and_return('csv content')
      end

      it 'returns error for missing required fields' do
        allow(CSVSafe).to receive(:read).and_return([
          ['ID', 'Name', 'Description'],
          ['1', '', 'Description 1']
        ])

        form.valid?
        expect(form.errors[:base]).to include(
          I18n.t(
            'administration.skills.errors.import.missing_fields_data',
            fields: 'Name',
            line_number: 2
          )
        )
      end

      context 'project validation' do
        let(:project) { create(:project) }
        let(:other_project) { create(:project) }
        let!(:skill_in_project) { create(:skill, project_id: project.id) }
        let!(:skill_in_other_project) { create(:skill, project_id: other_project.id) }

        it 'validates skill belongs to project when project_id is set' do
          form.project_id = project.id

          allow(CSVSafe).to receive(:read).and_return([
            ['ID', 'Name', 'Description'],
            [skill_in_other_project.id.to_s, 'Test Skill', 'Description']
          ])

          form.valid?
          expect(form.errors[:base]).to include(
            I18n.t(
              'administration.skills.errors.import.skill_not_in_project',
              skill_id: skill_in_other_project.id,
              line_number: 2
            )
          )
        end

        it 'allows skill that belongs to the project' do
          form.project_id = project.id

          allow(CSVSafe).to receive(:read).and_return([
            ['ID', 'Name', 'Description'],
            [skill_in_project.id.to_s, 'Test Skill', 'Description']
          ])

          form.valid?
          expect(form.errors[:base]).not_to include(
            match(/does not belong to this project/)
          )
        end

        it 'skips validation when skill ID is blank' do
          form.project_id = project.id

          allow(CSVSafe).to receive(:read).and_return([
            ['ID', 'Name', 'Description'],
            ['', 'Test Skill', 'Description']
          ])

          form.valid?
          expect(form.errors[:base]).not_to include(
            match(/does not belong to this project/)
          )
        end

        it 'skips validation when project_id is blank' do
          form.project_id = nil

          allow(CSVSafe).to receive(:read).and_return([
            ['ID', 'Name', 'Description'],
            [skill_in_other_project.id.to_s, 'Test Skill', 'Description']
          ])

          form.valid?
          expect(form.errors[:base]).not_to include(
            match(/does not belong to this project/)
          )
        end
      end
    end
  end

  describe 'REQUIRED_FIELDS constant' do
    it 'contains the expected fields' do
      expect(described_class::REQUIRED_FIELDS).to eq(%w[Name Description])
    end

    it 'is frozen' do
      expect(described_class::REQUIRED_FIELDS).to be_frozen
    end
  end
end
