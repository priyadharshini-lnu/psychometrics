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

  describe '#call' do
    let(:file_url) { 'https://example.com/skills.csv' }

    context 'with valid CSV data' do
      let(:unique_id) { rand(100_000..999_999) }

      before do
        Skill.where(id: unique_id).delete_all # Ensure no skill exists with this ID

        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,Name,Description,Category,Tag
              #{unique_id},Skill 1,Description 1,behavioral,"tag1,tag2"
              ,Skill 2,Description 2,technical,tag3
            CSV
          )
      end

      it 'imports skills with and without IDs' do
        result = described_class.new(file_url, project.id).call
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
        let!(:existing_skill) { create(:skill, id: unique_id, name: 'Old Name', project: project) }

        it 'updates existing skill when ID matches' do
          result = described_class.new(file_url, project.id).call
          expect(result).to eq true

          existing_skill.reload
          expect(existing_skill.name).to eq('Skill 1')
          expect(existing_skill.tag_list).to match_array(%w[tag1 tag2])
        end
      end
    end

    context 'with duplicate skill names' do
      let!(:existing_skill) { create(:skill, name: 'Programming', project: project) }

      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            ,Programming,Description 1,technical,tag1
          CSV
        )
      end

      it 'returns error for duplicate skill name' do
        result = described_class.new(file_url, project.id).call
        expect(result).to include("Line 2: Failed to save skill 'Programming': Name has already been taken")
      end

      it 'does not create or update any skills when there is a duplicate' do
        expect { described_class.new(file_url, project.id).call }.not_to change(Skill, :count)
        expect(existing_skill.reload.description).not_to eq('Description 1')
      end
    end

    context 'with empty tags' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            ,Skill 1,Description 1,behavioral,
          CSV
        )
      end

      it 'imports skills without tags' do
        result = described_class.new(file_url, project.id).call

        expect(result).to eq true
        skill = Skill.find_by(name: 'Skill 1')
        expect(skill).to be_present
        expect(skill.tag_list).to be_empty
        expect(skill.project_id).to eq(project.id)
      end
    end

    context 'with missing required fields' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Tag
            1,,Description 1,tag1
          CSV
        )
      end

      it 'returns error for missing required fields' do
        result = described_class.new(file_url, project.id).call
        expect(result).to include('Line 2: Missing required fields (Name)')
      end
    end

    context 'with categories' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            1,Leadership,Description 1,behavioral,tag1
            ,Programming,Description 2,technical,tag2
            ,Other Skill,Description 3,other,tag3
            ,Default Skill,Description 4,,tag4
            ,Invalid Cat,Description 5,invalid_category,tag5
          CSV
        )
      end

      it 'imports skills with correct categories' do
        result = described_class.new(file_url, project.id).call
        expect(result).to eq true

        expect(Skill.find_by(name: 'Leadership').category).to eq('behavioral')
        expect(Skill.find_by(name: 'Programming').category).to eq('technical')
        expect(Skill.find_by(name: 'Other Skill').category).to eq('other')
        expect(Skill.find_by(name: 'Default Skill').category).to eq('other')
        expect(Skill.find_by(name: 'Invalid Cat').category).to eq('other')
      end
    end

    context 'with download errors' do
      context 'when URL is invalid' do
        let(:file_url) { 'not-a-valid-url' }

        it 'returns error for invalid URL' do
          result = described_class.new(file_url, project.id).call
          expect(result.first).to start_with('Invalid URL:')
        end
      end

      context 'when file is not accessible' do
        let(:file_url) { 'http://example.com/nonexistent.csv' }

        before do
          stub_request(:get, file_url).to_return(status: 404)
        end

        it 'returns error for failed download' do
          result = described_class.new(file_url, project.id).call
          expect(result.first).to start_with('Failed to download file:')
        end
      end
    end

    context 'with nil project_id parameter' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            ,Global Skill,Global Description,behavioral,tag1
          CSV
        )
      end

      it 'creates skill without project association' do
        result = described_class.new(file_url, nil).call
        expect(result).to eq true

        skill = Skill.find_by(name: 'Global Skill')
        expect(skill).to be_present
        expect(skill.project).to be_nil
        expect(skill.description).to eq('Global Description')
        expect(skill.category).to eq('behavioral')
        expect(skill.tag_list).to match_array(['tag1'])
      end
    end

    context 'with different project_id parameters' do
      let(:another_project) { create(:project, client: client) }

      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            ,Project Skill,Project Description,behavioral,tag1
          CSV
        )
      end

      it 'assigns skills to the specified project' do
        # First import with one project
        result1 = described_class.new(file_url, project.id).call
        expect(result1).to eq true

        # Change the skill name to avoid uniqueness constraint
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Category,Tag
            ,Another Project Skill,Project Description,behavioral,tag1
          CSV
        )

        # Then import with another project
        result2 = described_class.new(file_url, another_project.id).call
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
