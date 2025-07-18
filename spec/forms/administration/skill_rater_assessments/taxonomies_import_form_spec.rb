# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::SkillRaterAssessments::TaxonomiesImportForm do
  let(:project) { create(:project) }
  let(:valid_file) do
    fixture_file_upload('spec/fixtures/files/skill_rater_assessments/valid_file.xlsx',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  end
  let(:invalid_file) { fixture_file_upload('spec/fixtures/files/test.csv') }

  describe '#valid?' do
    context 'with valid parameters' do
      let(:form) { described_class.new(file: valid_file, project_id: project.id) }

      it 'returns true' do
        expect(form.valid?).to be true
      end
    end

    context 'with invalid parameters' do
      context 'when file is missing' do
        let(:form) { described_class.new(project_id: project.id) }

        it 'returns false' do
          expect(form.valid?).to be false
          expect(form.errors[:file]).to include("can't be blank")
        end
      end

      context 'when project does not exist' do
        let(:form) { described_class.new(file: valid_file, project_id: -1) }

        it 'returns false' do
          expect(form.valid?).to be false
          expect(form.errors[:project]).to include('Project must exist')
        end
      end

      context 'when file has invalid format' do
        it 'validates file content type' do
          file = Rack::Test::UploadedFile.new(
            Rails.root.join('spec/fixtures/files/test.csv'),
            'text/plain'
          )
          form = described_class.new(file: file, project_id: project.id)
          expect(form.valid?).to be false
          expect(form.errors[:file]).to include('Please upload xlsx file')
        end
      end
    end
  end

  describe 'sheet validations' do
    let(:form) { described_class.new(file: valid_file, project_id: project.id) }
    let(:mock_excel) { double('Roo::Excelx') }

    before do
      allow(Roo::Excelx).to receive(:new).and_return(mock_excel)
    end

    context 'when required sheets are missing' do
      let(:sheets_present) { ['Job Group Levels', 'Job Roles'] }
      let(:sheets_missing) { described_class::REQUIRED_SHEET_NAMES - sheets_present }

      before do
        allow(mock_excel).to receive(:sheets).and_return(sheets_present)
        sheets_present.each do |sheet|
          allow(mock_excel).to receive(:sheet).with(sheet).and_return(double(row: [], last_row: 2))
        end
      end

      it 'adds error for missing sheets' do
        expect(form.valid?).to be false
        expect(form.errors[:file]).to include(
          "Missing required sheets: #{sheets_missing.join(', ')}"
        )
      end
    end

    context 'when all required sheets exist' do
      before do
        allow(mock_excel).to receive(:sheets).and_return(described_class::REQUIRED_SHEET_NAMES)
        described_class::REQUIRED_SHEET_NAMES.each do |sheet|
          allow(mock_excel).to receive(:sheet).with(sheet).and_return(double(row: [], last_row: 1))
        end
      end

      it 'does not add error for missing sheets' do
        form.valid?
        expect(form.errors[:file]).not_to include(:missing_sheets)
      end
    end
  end

  describe 'header validation' do
    let(:form) { described_class.new(file: valid_file, project_id: project.id) }
    let(:mock_excel) { double('Roo::Excelx') }

    before do
      allow(Roo::Excelx).to receive(:new).and_return(mock_excel)
      allow(mock_excel).to receive(:sheets).and_return(described_class::REQUIRED_SHEET_NAMES)

      described_class::REQUIRED_SHEET_NAMES.each do |sheet|
        allow(mock_excel).to receive(:sheet).with(sheet).and_return(double(row: [], last_row: 1))
      end
    end

    context 'when headers are invalid' do
      before do
        allow(mock_excel).to receive(:sheet).with('Job Group Levels').
          and_return(double(row: ['Wrong Header'], last_row: 1))
      end

      it 'adds error for invalid headers' do
        expect(form.valid?).to be false
        expect(form.errors[:file]).to include(
          'Job Group Levels sheet is missing required headers: Job Group, Label'
        )
      end
    end

    context 'when dynamic headers are invalid' do
      before do
        allow(mock_excel).to receive(:sheet).with('Job Group Levels').
          and_return(double(row: ['Job Group', 'Label'], last_row: 3)) # 3 rows = 2 levels

        allow(mock_excel).to receive(:sheet).with('Job Roles').
          and_return(double(row: ['Incorrect Header'], last_row: 1))
      end

      it 'adds error for invalid dynamic headers' do
        expect(form.valid?).to be false
        expected_error = [
          'Job Roles sheet is missing required headers:',
          'Job Group 1 - Code, Job Group 1 - Name,',
          'Job Group 2 - Code, Job Group 2 - Name,',
          'Job Title Code, Job Description, Job Title Name'
        ].join(' ')
        expect(form.errors[:file]).to include(/#{Regexp.escape(expected_error)}/)
      end
    end
  end

  describe 'content validation' do
    let(:form) { described_class.new(file: valid_file, project_id: project.id) }
    let(:mock_excel) { double('Roo::Excelx') }

    before do
      allow(Roo::Excelx).to receive(:new).and_return(mock_excel)
      allow(mock_excel).to receive(:sheets).and_return(described_class::REQUIRED_SHEET_NAMES)

      allow(mock_excel).to receive(:sheet).with('Job Group Levels').
        and_return(double(row: ['Job Group', 'Label'], last_row: 1))
      allow(mock_excel).to receive(:sheet).with('Skill Group Levels').
        and_return(double(row: ['Skill Group', 'Label'], last_row: 1))
      allow(mock_excel).to receive(:sheet).with('Job Roles').
        and_return(double(row: ['Job Group 1 - Code', 'Job Group 1 - Name', 'Job Title Code', 'Job Title Name'],
                          last_row: 1))
      allow(mock_excel).to receive(:sheet).with('Skills').
        and_return(double(
                     row: ['Skill Code', 'Skill Name', 'Skill Definition', 'Skill Type'], last_row: 1
                   ))
      allow(mock_excel).to receive(:sheet).with('Job Roles And Skills Mapping').
        and_return(double(
                     row: ['Job Title Code', 'Skill Name', 'Expected Proficiency Level'], last_row: 1
                   ))
    end

    context 'with blank values' do
      before do
        job_group_sheet = double('Sheet')
        allow(job_group_sheet).to receive(:row).with(1).and_return(['Job Group', 'Label'])
        allow(job_group_sheet).to receive(:row).with(2).and_return(['', 'Valid Label'])
        allow(job_group_sheet).to receive(:last_row).and_return(2)
        allow(mock_excel).to receive(:sheet).with('Job Group Levels').and_return(job_group_sheet)
      end

      it 'adds error for blank values' do
        expect(form.valid?).to be false
        expect(form.errors[:file]).to include(match(/Row 2: Missing value for Job Group/))
      end
    end

    context 'with duplicate values' do
      before do
        job_roles_sheet = double('Sheet')
        allow(job_roles_sheet).to receive(:row).with(1).and_return(['Job Title Code', 'Job Title Name'])
        allow(job_roles_sheet).to receive(:row).with(2).and_return(['HR001', 'HR Manager'])
        allow(job_roles_sheet).to receive(:row).with(3).and_return(['HR001', 'HR Director'])
        allow(job_roles_sheet).to receive(:last_row).and_return(3)
        allow(mock_excel).to receive(:sheet).with('Job Roles').and_return(job_roles_sheet)
      end

      it 'adds error for duplicates' do
        expect(form.valid?).to be false
        expect(form.errors[:file]).to include(match(/Row 3: Duplicate value HR001 for Job Title Code/))
      end
    end
  end
end
