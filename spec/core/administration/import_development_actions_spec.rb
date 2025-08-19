# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe Administration::ImportDevelopmentActions do
  let(:file_url) { 'https://example.com/development_actions.csv' }
  let!(:project) { Project.find(create(:project).id) }
  let!(:global_skill) { create(:skill, project: nil) }
  let!(:project_skill) { create(:skill, project_id: project.id) }
  let!(:other_project_skill) { create(:skill, project_id: create(:project).id) }
  let(:image_url) { 'https://example.com/course_image.jpg' }
  let(:file) { double('file', url: file_url) }

  describe 'Form Validation' do
    let(:csv_file) { fixture_file_upload('development_actions.csv', 'text/csv') }
    let(:form) { Api::V2::Administration::DevelopmentActionImportForm.new(file: csv_file) }

    context 'with valid CSV data' do
      it 'validates successfully' do
        expect(form).to be_valid
      end
    end

    context 'with missing required fields' do
      before do
        allow(CSVSafe).to receive(:read).with(
          csv_file.path,
          encoding: 'bom|utf-8'
        ).and_return(
          [
            ['ID', 'Name', 'Description'],
            ['1', 'Leadership Workshop', 'Attend workshop']
          ]
        )
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('administration.development_action_import.errors.missing_columns',
                 fields: 'SkillID, Type, DevelopmentActionType')
        )
      end
    end

    context 'with invalid learning style' do
      before do
        allow(CSVSafe).to receive(:read).with(csv_file.path, encoding: 'bom|utf-8').and_return(
          [
            [
              'ID', 'SkillID', 'Name', 'Description', 'Type', 'DevelopmentActionType',
              'CourseURL', 'CourseStartDate', 'CourseEndDate'
            ],
            [
              '1', global_skill.id, 'Leadership Workshop', 'Attend workshop', 'invalid_type',
              'course', 'https://example.com/course', '2025-01-01', '2025-12-31'
            ]
          ]
        )
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('administration.development_action_import.errors.invalid_learning_style',
                 row: 2,
                 value: 'invalid_type',
                 valid_types: 'structured_learning, learning_from_others, on_the_job')
        )
      end
    end
  end

  describe 'Import Service' do
    context 'with invalid URL' do
      let(:file) { double('file', url: 'not-a-url') }

      it 'raises an error for invalid URL format' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.errors.invalid_url_format')
        )
      end
    end

    context 'with unreachable URL' do
      let(:file) { double('file', url: file_url) }

      before do
        stub_request(:get, file_url).to_raise(OpenURI::HTTPError.new('404 Not Found', nil))
      end

      it 'raises an error for download failure' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.errors.download_failed', message: '404 Not Found')
        )
      end
    end

    context 'with valid data including image' do
      let(:course_start_date) { Date.new(2025, 1, 1) }
      let(:course_end_date) { Date.new(2025, 12, 31) }

      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate,CourseImage
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31,#{image_url}
            CSV
          )
        stub_request(:get, image_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'image/png' },
            body: Rails.root.join('spec/fixtures/files/profile.png').read
          )
      end

      it 'imports development action with course details and image' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        # Check individual attributes instead of using have_attributes
        expect(development_action.name).to eq('Leadership Workshop')
        expect(development_action.description).to eq('Attend workshop')
        expect(development_action.learning_style).to eq('structured_learning')
        expect(development_action.course_url).to eq('https://example.com/course')
        expect(development_action.development_action_type).to eq('course')
        expect(development_action.project_id).to eq(project.id)

        # Compare dates using to_date to avoid time zone issues
        expect(development_action.course_start_date.to_date).to eq(course_start_date)
        expect(development_action.course_end_date.to_date).to eq(course_end_date)

        expect(development_action.image).to be_attached
        expect(development_action.skills).to include(global_skill)
      end
    end

    context 'with project-specific skill' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,#{project_skill.id},Project Skill Workshop,Attend workshop,structured_learning,default,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'imports development action with project skill' do
        expect { described_class.new(file, project.id).call }.not_to raise_error
        development_action = DevelopmentAction.last
        expect(development_action.skills).to include(project_skill)
        expect(development_action.project_id).to eq(project.id)
        expect(development_action.development_action_type).to eq('default')
      end
    end

    context 'with invalid image URL' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate,CourseImage
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31,invalid-url
            CSV
          )
      end

      it 'raises an error for invalid image URL' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.invalid_image_url', url: 'invalid-url')
        )
      end
    end

    context 'with invalid date format' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,course,https://example.com/course,invalid-date,2025-12-31
            CSV
          )
      end

      it 'raises an error for invalid date format' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.development_action_import.errors.invalid_date',
            date: 'invalid-date'
          )
        )
      end
    end

    context 'with non-existent skill ID' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,999999,Leadership Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'raises an error for non-existent skill' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.skill_not_found', skill_id: '999999')
        )
      end
    end

    context 'with multiple comma-separated skill IDs' do
      let!(:additional_skill) { create(:skill, project: nil) }

      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,"#{global_skill.id},#{project_skill.id},#{additional_skill.id}",Multi-Skill Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'imports development action with multiple skills' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        expect(development_action.name).to eq('Multi-Skill Workshop')
        expect(development_action.description).to eq('Attend workshop')
        expect(development_action.learning_style).to eq('structured_learning')
        expect(development_action.development_action_type).to eq('course')
        expect(development_action.project_id).to eq(project.id)

        expect(development_action.skills).to include(global_skill)
        expect(development_action.skills).to include(project_skill)
        expect(development_action.skills).to include(additional_skill)
        expect(development_action.skills.count).to eq(3)
      end
    end

    context 'with multiple skill IDs with spaces' do
      let!(:additional_skill) { create(:skill, project: nil) }

      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1," #{global_skill.id} , #{project_skill.id} , #{additional_skill.id} ",Spaced Skills Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'handles spaces around comma-separated skill IDs correctly' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        expect(development_action.skills).to include(global_skill)
        expect(development_action.skills).to include(project_skill)
        expect(development_action.skills).to include(additional_skill)
        expect(development_action.skills.count).to eq(3)
      end
    end

    context 'with one non-existent skill in comma-separated list' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,"#{global_skill.id},999999,#{project_skill.id}",Mixed Skills Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'raises an error for the non-existent skill ID' do
        expect { described_class.new(file, project.id).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.skill_not_found', skill_id: '999999')
        )
      end
    end

    context 'with empty skill IDs in comma-separated list' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,"#{global_skill.id},,#{project_skill.id}",Workshop with Empty Skill,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'ignores empty skill IDs and processes valid ones' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        expect(development_action.skills).to include(global_skill)
        expect(development_action.skills).to include(project_skill)
        expect(development_action.skills.count).to eq(2)
      end
    end

    context 'with single skill ID (backward compatibility)' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,#{global_skill.id},Single Skill Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'still works with single skill ID for backward compatibility' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        expect(development_action.name).to eq('Single Skill Workshop')
        expect(development_action.skills).to include(global_skill)
        expect(development_action.skills.count).to eq(1)
      end
    end

    context 'with duplicate skill IDs in comma-separated list' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,DevelopmentActionType,CourseURL,CourseStartDate,CourseEndDate
              1,"#{global_skill.id},#{global_skill.id},#{project_skill.id}",Duplicate Skills Workshop,Attend workshop,structured_learning,course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'handles duplicate skill IDs without creating duplicate associations' do
        expect { described_class.new(file, project.id).call }.not_to raise_error

        development_action = DevelopmentAction.last

        expect(development_action.skills).to include(global_skill)
        expect(development_action.skills).to include(project_skill)
        expect(development_action.skills.count).to eq(2)
      end
    end
  end
end
