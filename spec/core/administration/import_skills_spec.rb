# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe Administration::ImportSkills do
  before do
    stub_wisper_publisher('AI::EmbeddingService', :call, :ok, [])
  end

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

  def expect_successful_import(result, expected_skill_names)
    expect(result[:ok]).to be_an(Array)
    expect(result[:error]).to be_blank

    imported_skill_ids = result[:ok]
    expect(imported_skill_ids.length).to eq(expected_skill_names.length)

    expected_skill_names.each do |skill_name|
      skill = Skill.find_by(name: skill_name)
      expect(skill).to be_present
      expect(imported_skill_ids).to include(skill.id)
    end
  end

  describe '#call' do
    before do
      allow(CsvFileParser).to receive(:call!).with(file).and_return(csv)
    end

    context 'with valid CSV data' do
      it 'imports skills with and without IDs' do
        result = described_class.call(file, project.id)
        expect_successful_import(result, ['Skill 1', 'Skill 2'])

        skill1 = Skill.find_by(name: 'Skill 1')
        expect(skill1.description).to eq('Description 1')
        expect(skill1.tag_list).to match_array(%w[tag1 tag2])
        expect(skill1.project_id).to eq(project.id)

        skill2 = Skill.find_by(name: 'Skill 2')
        expect(skill2.description).to eq('Description 2')
        expect(skill2.tag_list).to match_array(['tag3'])
        expect(skill2.project_id).to eq(project.id)
      end

      context 'when updating existing skills' do
        it 'updates existing skill when ID matches' do
          result = described_class.call(file, project.id)
          expect_successful_import(result, ['Skill 1', 'Skill 2'])

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
          res = described_class.call(file, project.id)
          expect(res[:error]).to eq(I18n.t(
                                      'administration.skills.errors.import.save_failed',
                                      line_number: 2,
                                      name: existing_skill.name,
                                      message: 'Validation failed: Name has already been taken'
                                    ))
        end.to change(Skill, :count).by(0)
        expect(existing_skill.reload.description).not_to eq('Description 1')
      end
    end

    context 'with empty tags' do
      it 'imports skills without tags' do
        existing_skill = create(:skill, name: 'Existing Skill', project: project)

        csv << [
          existing_skill.id,
          'Existing Skill',
          'Description 1',
          'behavioral',
          ''
        ]

        result = described_class.call(file, project.id)
        expect_successful_import(result, ['Skill 1', 'Skill 2', 'Existing Skill'])

        existing_skill.reload
        expect(existing_skill.tag_list).to be_empty
        expect(existing_skill.project_id).to eq(project.id)
      end
    end

    context 'with skill_types' do
      it 'imports skills with correct skill_types' do
        csv[3] = ['', 'Other Skill', 'Description 3', 'other', 'tag3']
        csv[4] = ['', 'Invalid Cat', 'Description 5', 'invalid_category', 'tag5']
        csv[5] = ['', 'Default Skill', 'Description 4', '', 'tag4']
        result = described_class.call(file, project.id)
        expect_successful_import(result, ['Skill 1', 'Skill 2', 'Other Skill', 'Invalid Cat', 'Default Skill'])

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
          res = described_class.call(invalid_file, project.id)
          expect(res[:error]).to eq(I18n.t('administration.errors.invalid_url_format'))
        end
      end

      context 'when file is not accessible' do
        it 'raises Errors::DownloadFailedError for failed download' do
          allow(CsvFileParser).to receive(:call!).with(file).and_raise(Errors::DownloadFailedError, 'Download failed')

          res = described_class.call(file, project.id)
          expect(res[:error]).to eq('Download failed')
        end
      end
    end

    context 'with nil project_id parameter' do
      it 'creates skill without project association' do
        csv[2][1] = 'Global Skill'
        result = described_class.call(file, nil)
        expect_successful_import(result, ['Skill 1', 'Global Skill'])

        skill = Skill.find_by(name: 'Global Skill')
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
        result1 = described_class.call(file, project.id)
        expect_successful_import(result1, ['Project Skill'])

        # Change the skill name to avoid uniqueness constraint
        allow(CsvFileParser).to receive(:call!).with(file).and_return(
          [
            ['ID', 'Name', 'Description', 'SkillType', 'Tag'],
            [nil, 'Another Project Skill', 'Another Project Description', 'technical', 'tag2']
          ]
        )

        # Then import with another project
        result2 = described_class.call(file, another_project.id)
        expect_successful_import(result2, ['Another Project Skill'])

        project_skill = Skill.find_by(name: 'Project Skill')
        expect(project_skill.project_id).to eq(project.id)

        another_project_skill = Skill.find_by(name: 'Another Project Skill')
        expect(another_project_skill.project_id).to eq(another_project.id)
      end
    end

    context 'with skill group assignment' do
      let!(:skill_group) { create(:skill_group, name: 'Programming', project: project) }

      it 'assigns existing skill group to the skill' do
        csv_with_group = [
          ['ID', 'Name', 'Description', 'SkillType', 'SkillGroup', 'Tag'],
          [nil, 'JavaScript', 'JavaScript programming', 'technical', 'Programming', 'frontend']
        ]

        allow(CsvFileParser).to receive(:call!).with(file).and_return(csv_with_group)

        result = described_class.call(file, project.id)
        expect_successful_import(result, ['JavaScript'])

        skill = Skill.find_by(name: 'JavaScript')
        expect(skill.skill_group).to eq(skill_group)
      end

      it 'does not assign non-existent skill group' do
        csv_with_group = [
          ['ID', 'Name', 'Description', 'SkillType', 'SkillGroup', 'Tag'],
          [nil, 'JavaScript', 'JavaScript programming', 'technical', 'NonExistent', 'frontend']
        ]

        allow(CsvFileParser).to receive(:call!).with(file).and_return(csv_with_group)

        result = described_class.call(file, project.id)
        expect_successful_import(result, ['JavaScript'])

        skill = Skill.find_by(name: 'JavaScript')
        expect(skill.skill_group).to be_nil
      end
    end

    context 'embedding generation during bulk import' do
      it 'skips individual embedding generation during import' do
        expect(VectorEmbeddingGenerationJob).not_to receive(:perform_later)

        result = described_class.call(file, project.id)
        expect_successful_import(result, ['Skill 1', 'Skill 2'])
      end
    end
  end
end
