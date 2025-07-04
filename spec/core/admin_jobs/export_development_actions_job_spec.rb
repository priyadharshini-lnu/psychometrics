# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportDevelopmentActionsJob, type: :job do
  let(:project) { Project.find(create(:project).id) }
  let(:skill) { create(:skill, project: project) }
  let(:global_skill) { create(:skill, project: nil) }
  let!(:development_action) do
    action = create(:development_action,
                    project_id: project.id,
                    name: 'Test Action',
                    description: 'Test Description',
                    learning_style: 'structured_learning',
                    development_action_type: 'course',
                    available_languages: %w[en ar],
                    duration: 120,
                    course_url: 'https://example.com',
                    course_start_date: Date.new(2024, 1, 1),
                    course_end_date: Date.new(2024, 12, 31))
    action.skills << skill
    action.skills << global_skill

    # Attach test image
    action.image.attach(
      io: Rails.root.join('spec/fixtures/files/profile.png').open,
      filename: 'profile.png',
      content_type: 'image/png'
    )

    action
  end

  let(:record) { create(:admin_job_record, data: { 'project_id' => project.id }) }
  let(:job) { described_class.new(record) }

  describe '#headers' do
    it 'returns the correct headers for the CSV' do
      expect(job.headers).to eq(%w[
        ID
        SkillID
        Name
        Description
        Type
        ProjectID
        DevelopmentActionType
        AvailableLanguages
        CourseURL
        CourseStartDate
        CourseEndDate
        CourseImage
        Duration
      ])
    end
  end

  describe '#data_row' do
    let(:expected_base_row) do
      [
        development_action.id,
        nil, # skill ID will be filled in per row
        'Test Action',
        'Test Description',
        'structured_learning',
        project.id,
        'course',
        'en, ar',
        'https://example.com',
        development_action.course_start_date.to_date.strftime('%Y-%m-%d'),
        development_action.course_end_date.to_date.strftime('%Y-%m-%d'),
        'http://example.com/test-image.png',
        120
      ]
    end

    it 'returns formatted rows of data for csv' do
      development_action = job.records_for_export.first
      allow(development_action).to receive(:image_url).and_return('http://example.com/test-image.png')
      data_rows = job.data_row(development_action)

      expect(data_rows.size).to eq(2) # One row per skill

      # Sort rows by skill ID to ensure consistent ordering
      sorted_rows = data_rows.sort_by { |row| row[1] }
      project_skill_row = sorted_rows.find { |row| row[1] == skill.id }
      global_skill_row = sorted_rows.find { |row| row[1] == global_skill.id }

      # Check project skill row
      expect(project_skill_row).to match_array(expected_base_row.dup.tap { |row| row[1] = skill.id })

      # Check global skill row
      expect(global_skill_row).to match_array(expected_base_row.dup.tap { |row| row[1] = global_skill.id })

      # Verify both rows share the same development action ID
      expect(project_skill_row[0]).to eq(global_skill_row[0])
    end

    it 'handles missing image_url gracefully' do
      development_action = job.records_for_export.first
      allow(development_action).to receive(:image_url).and_return(nil)

      data_rows = job.data_row(development_action)
      expect(data_rows.map { |row| row[-2] }).to all(be_nil)
    end
  end

  describe '#file_name' do
    it 'returns the correct file name' do
      expect(job.file_name).to eq("#{project.name}-development-actions.csv")
    end
  end

  describe '#generate_details' do
    it 'returns an array with translated label and file link' do
      allow(job).to receive(:file_link).and_return('link_to_file')
      expect(job.generate_details).to eq([
        [I18n.t('administration.development_actions.export.details'), 'link_to_file']
      ])
    end
  end

  describe '#records_for_export' do
    it 'returns development actions for the specified project' do
      expect(job.records_for_export).to include(development_action)
    end

    context 'when there are no development actions' do
      before { development_action.destroy }

      it 'returns an empty relation' do
        expect(job.records_for_export).to be_empty
      end
    end
  end
end
