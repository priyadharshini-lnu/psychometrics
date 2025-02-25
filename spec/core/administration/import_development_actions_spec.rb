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

  describe 'Form Validation' do
    let(:csv_file) { fixture_file_upload('development_actions.csv', 'text/csv') }
    let(:form) { Api::V2::Administration::DevelopmentActionImportForm.new(file: csv_file) }

    context 'with valid CSV data' do
      before do
        allow(csv_file).to receive(:read).and_return(<<~CSV
          ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate,CourseImage
          1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,#{project.id},course,https://example.com/course,2025-01-01,2025-12-31,#{image_url}
        CSV
                                                    )
      end

      it 'validates successfully' do
        expect(form).to be_valid
      end
    end

    context 'with missing required fields' do
      before do
        allow(csv_file).to receive(:read).and_return(<<~CSV
          ID,Name,Description
          1,Leadership Workshop,Attend workshop
        CSV
                                                    )
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('administration.development_action_import.errors.missing_columns',
                 fields: 'SkillID, Type, Category')
        )
      end
    end

    context 'with invalid learning style' do
      before do
        allow(csv_file).to receive(:read).and_return(<<~CSV
          ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate
          1,#{global_skill.id},Leadership Workshop,Attend workshop,invalid_type,#{project.id},course,https://example.com/course,2025-01-01,2025-12-31
        CSV
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
      let(:invalid_url) { 'not-a-url' }

      it 'raises an error for invalid URL format' do
        expect { described_class.new(invalid_url).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.invalid_url_format')
        )
      end
    end

    context 'with unreachable URL' do
      before do
        stub_request(:get, file_url).to_raise(OpenURI::HTTPError.new('404 Not Found', nil))
      end

      it 'raises an error for download failure' do
        expect { described_class.new(file_url).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.download_failed', message: '404 Not Found')
        )
      end
    end

    context 'with valid data including image' do
      let(:expected_development_action) do
        {
          name: 'Leadership Workshop',
          description: 'Attend workshop',
          learning_style: 'structured_learning',
          course_url: 'https://example.com/course',
          course_start_date: Date.new(2025, 1, 1),
          course_end_date: Date.new(2025, 12, 31),
          category: 'course'
        }
      end

      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate,CourseImage
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,#{project.id},course,https://example.com/course,2025-01-01,2025-12-31,#{image_url}
            CSV
          )

        stub_request(:get, image_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'image/png' },
            body: File.read(Rails.root.join('spec/fixtures/files/profile.png'))
          )
      end

      it 'imports development action with course details and image' do
        expect { described_class.new(file_url).call }.to change(DevelopmentAction, :count).by(1)

        development_action = DevelopmentAction.last
        expect(development_action).to have_attributes(expected_development_action)
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
              ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate
              1,#{project_skill.id},Project Skill Workshop,Attend workshop,structured_learning,#{project.id},default,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'imports development action with project skill' do
        expect { described_class.new(file_url).call }.not_to raise_error
        development_action = DevelopmentAction.last
        expect(development_action.skills).to include(project_skill)
        expect(development_action.project_id).to eq(project.id)
        expect(development_action.category).to eq('default')
      end
    end

    context 'with invalid image URL' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate,CourseImage
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,#{project.id},course,https://example.com/course,2025-01-01,2025-12-31,invalid-url
            CSV
          )
      end

      it 'raises an error for invalid image URL' do
        expect { described_class.new(file_url).call }.to raise_error(
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
              ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate
              1,#{global_skill.id},Leadership Workshop,Attend workshop,structured_learning,#{project.id},course,https://example.com/course,invalid-date,2025-12-31
            CSV
          )
      end

      it 'raises an error for invalid date format' do
        expect { described_class.new(file_url).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.invalid_date_format', date: 'invalid-date')
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
              ID,SkillID,Name,Description,Type,ProjectID,Category,CourseURL,CourseStartDate,CourseEndDate
              1,999999,Leadership Workshop,Attend workshop,structured_learning,#{project.id},course,https://example.com/course,2025-01-01,2025-12-31
            CSV
          )
      end

      it 'raises an error for non-existent skill' do
        expect { described_class.new(file_url).call }.to raise_error(
          Errors::ImportError,
          I18n.t('administration.development_action_import.errors.skill_not_found', skill_id: '999999')
        )
      end
    end
  end
end
