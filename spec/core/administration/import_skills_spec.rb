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
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,Name,Description,Project,Category,Tag
              1,Skill 1,Description 1,#{project.id},behavioral,"tag1,tag2"
              2,Skill 2,Description 2,#{project.id},technical,tag3
            CSV
          )
      end

      it 'imports skills with tags' do
        result = described_class.new(file_url).call

        expect(result).to eq true

        skill1 = Skill.find_by(id: 1)
        expect(skill1).to be_present
        expect(skill1.tag_list).to match_array(%w[tag1 tag2])
        expect(skill1.category).to eq('behavioral')
        expect(skill1.project).to be_a(Project)

        skill2 = Skill.find_by(id: 2)
        expect(skill2).to be_present
        expect(skill2.tag_list).to match_array(['tag3'])
        expect(skill2.category).to eq('technical')
        expect(skill2.project).to be_a(Project)
      end
    end

    context 'with empty tags' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Category,Tag
            1,Skill 1,Description 1,#{project.id},behavioral,
          CSV
        )
      end

      it 'imports skills without tags' do
        result = described_class.new(file_url).call

        expect(result).to eq true
        skill = Skill.find_by(id: 1)
        expect(skill).to be_present
        expect(skill.tag_list).to be_empty
        expect(skill.category).to eq('behavioral')
        expect(skill.project).to be_a(Project)
      end
    end

    context 'with invalid project ID' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Tag
            1,Skill 1,Description 1,999999,tag1
          CSV
        )
      end

      it 'returns error for non-existent project' do
        result = described_class.new(file_url).call

        expect(result).to include("Project '999999' not found for skill ID: 1")
      end
    end

    context 'with duplicate skill IDs' do
      let!(:existing_skill) { create(:skill, id: 1, project: project) }

      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Tag
            1,Skill 1,Description 1,#{project.id},tag1
          CSV
        )
      end

      it 'returns error for duplicate ID' do
        result = described_class.new(file_url).call

        expect(result).to include('Duplicate ID found for skill ID: 1')
      end

      it 'skips duplicates when ignore_duplicates is true' do
        result = described_class.new(file_url, ignore_duplicates: true).call

        expect(result).to eq true
      end
    end

    context 'with missing required fields' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Tag
            1,,Description 1,#{project.id},tag1
          CSV
        )
      end

      it 'returns error for missing required fields' do
        result = described_class.new(file_url).call

        expect(result).to include('Missing required fields (Name) for skill ID: 1')
      end
    end

    context 'with empty ID' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Tag
            ,Skill 1,Description 1,#{project.id},tag1
          CSV
        )
      end

      it 'skips rows with empty IDs' do
        result = described_class.new(file_url).call

        expect(result).to eq true
        expect(Skill.count).to eq(0)
      end
    end

    context 'with malformed CSV' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: "ID,Name\n1,\"Unclosed Quote\n2,Test"
        )
      end

      it 'handles malformed CSV gracefully' do
        result = described_class.new(file_url).call

        expect(result).to include('Invalid CSV format: Unclosed quoted field in line 2.')
      end
    end

    context 'with categories' do
      before do
        stub_request(:get, file_url).to_return(
          status: 200,
          body: <<~CSV
            ID,Name,Description,Project,Category,Tag
            1,Leadership,Description 1,#{project.id},behavioral,tag1
            2,Programming,Description 2,#{project.id},technical,tag2
            3,Other Skill,Description 3,#{project.id},other,tag3
            4,Default Skill,Description 4,#{project.id},,tag4
            5,Invalid Cat,Description 5,#{project.id},invalid_category,tag5
          CSV
        )
      end

      it 'imports skills with correct categories' do
        result = described_class.new(file_url).call

        expect(result).to eq true

        skill1 = Skill.find_by(id: 1)
        expect(skill1.category).to eq('behavioral')
        expect(skill1.project).to be_a(Project)

        skill2 = Skill.find_by(id: 2)
        expect(skill2.category).to eq('technical')
        expect(skill2.project).to be_a(Project)

        skill3 = Skill.find_by(id: 3)
        expect(skill3.category).to eq('other')
        expect(skill3.project).to be_a(Project)

        skill4 = Skill.find_by(id: 4)
        expect(skill4.category).to eq('other')
        expect(skill4.project).to be_a(Project)

        skill5 = Skill.find_by(id: 5)
        expect(skill5.category).to eq('other')
        expect(skill5.project).to be_a(Project)
      end

      it 'adds warning for invalid category' do
        result = described_class.new(file_url).call

        expect(result).to eq true
      end
    end

    context 'with download errors' do
      context 'when URL is invalid' do
        let(:file_url) { 'not-a-valid-url' }

        it 'returns error for invalid URL' do
          result = described_class.new(file_url).call
          expect(result.first).to start_with('Invalid URL:')
        end
      end

      context 'when file is not accessible' do
        let(:file_url) { 'http://example.com/nonexistent.csv' }

        before do
          stub_request(:get, file_url).to_return(status: 404)
        end

        it 'returns error for failed download' do
          result = described_class.new(file_url).call
          expect(result.first).to start_with('Failed to download file:')
        end
      end

      context 'when server returns an error' do
        let(:file_url) { 'http://example.com/skills.csv' }

        before do
          stub_request(:get, file_url).to_return(status: 500)
        end

        it 'returns error for server error' do
          result = described_class.new(file_url).call
          expect(result.first).to start_with('Failed to download file:')
        end
      end

      context 'when connection times out' do
        let(:file_url) { 'http://example.com/skills.csv' }

        before do
          stub_request(:get, file_url).to_timeout
        end

        it 'returns error for timeout' do
          result = described_class.new(file_url).call
          expect(result.first).to start_with('Error downloading file:')
        end
      end
    end
  end
end
