# frozen_string_literal: true

require 'rails_helper'

describe AdminJobSteps::ImportTaxonomies::ImportJob do
  include ActiveJob::TestHelper

  let(:client) { create(:tenancy) }
  let(:project) { Project.find(create(:project, client: client).id) }
  let(:file_path) do
    Rails.root.join('spec/fixtures/files/skill_rater_assessments/valid_file.xlsx')
  end
  let(:file_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: File.open(file_path),
      filename: 'valid_file.xlsx',
      content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  end
  let(:parent_job) do
    job = create(
      :admin_job_record,
      operation: :import_skill_rater_taxonomies,
      data: { project_id: project.id }
    )
    job.file.attach(file_blob)
    job
  end
  let(:job_record) do
    create(
      :admin_job_record,
      operation: :import_skill_rater_taxonomies,
      parent_job: parent_job,
      data: { project_id: project.id }
    )
  end

  before do
    stub_wisper_publisher('AI::EmbeddingService', :call, :ok, [])
  end

  describe '#perform' do
    context 'when import succeeds' do
      let(:imported_skill_ids) { [1, 2, 3] }

      before do
        stub_wisper_publisher('SkillRaterAssessments::ImportTaxonomies', :call, :ok, imported_skill_ids)
      end

      it 'updates job status to in_progress and completes successfully' do
        expect(job_record).to receive(:update!).with(status: :in_progress)
        expect(job_record).to receive(:increment_completed_tasks!)

        described_class.new.perform(job_record)
      end

      it 'stores imported skill IDs in parent job data' do
        expect(job_record.parent_job).to receive(:update!).with(
          data: { 'imported_skill_ids' => imported_skill_ids }
        )

        described_class.new.perform(job_record)
      end

      it 'handles global import (no project)' do
        global_job_record = create(:admin_job_record, operation: :import_skill_rater_taxonomies,
          parent_job: parent_job, data: {})

        expect(global_job_record.parent_job).to receive(:update!).with(
          data: { 'imported_skill_ids' => imported_skill_ids }
        )

        described_class.new.perform(global_job_record)
      end
    end

    context 'when import fails' do
      before do
        stub_wisper_publisher('SkillRaterAssessments::ImportTaxonomies', :call, :error, 'Import error occurred')
      end

      it 'fails the job with error message' do
        expect(job_record).to receive(:fail!).with(['Import failed: Import error occurred'])

        described_class.new.perform(job_record)
      end
    end

    context 'when an exception occurs' do
      before do
        allow_any_instance_of(described_class).to receive(:project_from_data).and_raise(StandardError, 'Test error')
      end

      it 'fails the job with exception details' do
        expect(job_record).to receive(:fail!).with(['Test error'], kind_of(StandardError))

        described_class.new.perform(job_record)
      end
    end
  end

  describe '#project_from_data' do
    let(:job) { described_class.new }

    it 'returns project when project_id is present' do
      job_record = double(data: { 'project_id' => project.id })
      expect(job.send(:project_from_data, job_record)).to eq(project)
    end

    it 'returns nil when project_id is not present' do
      job_record = double(data: {})
      expect(job.send(:project_from_data, job_record)).to be_nil
    end
  end
end
