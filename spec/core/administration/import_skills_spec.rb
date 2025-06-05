# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe Administration::ImportSkills do
  let(:project_manager) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: project_manager)
  end
  let(:project) { Project.find(create(:project, client: client).id) }
  let(:skill) { create(:skill, project: project) }
  let(:csv) do
    [
      ['ID', 'Name', 'Description', 'SkillType', 'Tag'],
      [skill.id, 'Skill 1', 'Description 1', 'behavioral', 'tag1,tag2'],
      [nil, 'Skill 2', 'Description 2', 'technical', 'tag3']
    ]
  end
  let(:file) { double('file', url: 'https://example.com/skills.csv') }

  describe '#call' do
    before do
      allow(CsvFileParser).to receive(:call!).with(file).and_return(csv)
    end

    context 'with valid CSV data' do
      it 'imports skills with and without IDs' do
        result = described_class.new(file, project.id).call
        expect(result).to eq true

        skill1 = Skill.find_by(name: 'Skill 1')
        expect(skill1).to be_present
        expect(skill1.description).to eq('Description 1')
        expect(skill1.tag_list).to match_array(%w[tag1 tag2])
        expect(skill1.project_id).to eq(project.id)

        skill2 = Skill.find_by(name: 'Skill 2')
        expect(skill2).to be_present
        expect(skill2.description).to eq('Description 2')
        expect(skill2.tag_list).to match_array(['tag3'])
        expect(skill2.project_id).to eq(project.id)
      end

      context 'when updating existing skills' do
        it 'updates existing skill when ID matches' do
          result = described_class.new(file, project.id).call
          expect(result).to eq true

          skill.reload
          expect(skill.name).to eq('Skill 1')
          expect(skill.tag_list).to match_array(%w[tag1 tag2])
        end
      end
    end

    context 'with duplicate skill names and does not create or update any skills when there is a duplicate' do
      let!(:existing_skill) { create(:skill, name: 'Programming', project: project) }

      it 'returns error for duplicate skill name' do
        csv[1][1] = existing_skill.name # Set the name to the existing skill name
        csv[1][2] = 'Description 1'
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.skills.errors.import.save_failed',
            line_number: 2,
            name: existing_skill.name,
            message: 'Validation failed: Name has already been taken'
          )
        ).and change(Skill, :count).by(0)
        expect(existing_skill.reload.description).not_to eq('Description 1')
      end
    end

    context 'with empty tags' do
      it 'imports skills without tags' do
        result = described_class.new(file, project.id).call

        existing_skill = create(:skill, name: 'Existing Skill', project: project)

        csv << [
          existing_skill.id,
          'Existing Skill',
          'Description 1',
          'behavioral',
          ''
        ]

        expect(result).to eq true
        expect(existing_skill).to be_present
        expect(existing_skill.tag_list).to be_empty
        expect(existing_skill.project_id).to eq(project.id)
      end
    end

    context 'with skill_types' do
      it 'imports skills with correct skill_types' do
        csv[3] = ['', 'Other Skill', 'Description 3', 'other', 'tag3']
        csv[4] = ['', 'Invalid Cat', 'Description 5', 'invalid_category', 'tag5']
        csv[5] = ['', 'Default Skill', 'Description 4', '', 'tag4']
        result = described_class.new(file, project.id).call
        expect(result).to eq true

        expect(Skill.find_by(name: 'Skill 1').skill_type).to eq('behavioral')
        expect(Skill.find_by(name: 'Skill 2').skill_type).to eq('technical')
        expect(Skill.find_by(name: 'Other Skill').skill_type).to eq('other')
        expect(Skill.find_by(name: 'Default Skill').skill_type).to eq('other')
        expect(Skill.find_by(name: 'Invalid Cat').skill_type).to eq('other')
      end
    end

    context 'with download errors' do
      before do
        allow(CsvFileParser).to receive(:call!).with(invalid_file).and_call_original
      end
      let(:invalid_file) { double('file', url: 'abc') }

      context 'when URL is invalid' do
        it 'returns error for invalid URL' do
          expect do
            described_class.new(invalid_file, project.id).call
          end.to raise_error(
            Errors::ImportError,
            I18n.t('administration.errors.invalid_url_format')
          )
        end
      end

      context 'when file is not accessible' do
        it 'raises Errors::DownloadFailedError for failed download' do
          allow(CsvFileParser).to receive(:call!).with(file).and_raise(Errors::DownloadFailedError, 'Download failed')

          expect do
            described_class.new(file, project.id).call
          end.to raise_error(Errors::ImportError, 'Download failed')
        end
      end
    end

    context 'with nil project_id parameter' do
      it 'creates skill without project association' do
        csv[2][1] = 'Global Skill'
        result = described_class.new(file, nil).call
        expect(result).to eq true

        skill = Skill.find_by(name: 'Global Skill')
        expect(skill).to be_present
        expect(skill.project).to be_nil
        expect(skill.description).to eq('Description 2')
        expect(skill.skill_type).to eq('technical')
        expect(skill.tag_list).to match_array(['tag3'])
      end
    end

    context 'with different project_id parameters' do
      let(:another_project) { create(:project, client: client) }

      before do
        allow(CsvFileParser).to receive(:call!).with(file).and_return(
          [
            ['ID', 'Name', 'Description', 'SkillType', 'Tag'],
            [nil, 'Project Skill', 'Project Description', 'behavioral', 'tag1']
          ]
        )
      end

      it 'assigns skills to the specified project' do
        # First import with one project
        result1 = described_class.new(file, project.id).call
        expect(result1).to eq true

        # Change the skill name to avoid uniqueness constraint
        allow(CsvFileParser).to receive(:call!).with(file).and_return(
          [
            ['ID', 'Name', 'Description', 'SkillType', 'Tag'],
            [nil, 'Another Project Skill', 'Another Project Description', 'technical', 'tag2']
          ]
        )

        # Then import with another project
        result2 = described_class.new(file, another_project.id).call
        expect(result2).to eq true

        project_skill = Skill.find_by(name: 'Project Skill')
        expect(project_skill).to be_present
        expect(project_skill.project_id).to eq(project.id)

        another_project_skill = Skill.find_by(name: 'Another Project Skill')
        expect(another_project_skill).to be_present
        expect(another_project_skill.project_id).to eq(another_project.id)
      end
    end
  end
end
