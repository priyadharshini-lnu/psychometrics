# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportSkillsJob do
  include ActiveJob::TestHelper
  let(:client) { create(:tenancy) }
  let(:project) { Project.find(create(:project, client: client).id) }
  let(:skill) { create(:skill, project: project) }
  let(:csv_content) do
    [
      ['ID', 'Name', 'Description', 'SkillType', 'Tag'],
      [skill.id, 'Skill 1', 'Description 1', 'behavioral', 'tag1,tag2'],
      [nil, 'Skill 2', 'Description 2', 'technical', 'tag3']
    ].map(&:to_csv).join
  end
  let(:file_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new(csv_content),
      filename: 'skills.csv',
      content_type: 'text/csv'
    )
  end
  let(:owner) { create(:tenancy) }
  let(:user) { create(:superadmin) }
  let(:job_record) do
    job = create(
      :admin_job_record,
      operation: :import_skills,
      data: { owner_id: owner.id, project_id: project.id }
    )
    job.file.attach(file_blob)
    job
  end

  before do
    allow(job_record).to receive(:owner).and_return(user)
    allow(CsvFileParser).to receive(:call!).with(job_record.file).and_return(csv_content)
  end

  describe '.call' do
    context 'when Administration::ImportSkills fails' do
      before do
        stub_wisper_publisher('Administration::ImportSkills', :call, :error, 'Import failed due to invalid CSV format')
      end

      it 'fails the job and sets parent job status to failed' do
        job_record = nil

        perform_enqueued_jobs do
          expect do
            job_record = AdminJob.call(:import_skills, { owner_id: owner.id, project_id: project.id }, user)
          end.to change { AdminJobRecord.count }.by(2)
        end

        job_record.reload
        expect(job_record.status).to eq('failed')
        expect(job_record.error_messages).to include('Import failed: Import failed due to invalid CSV format')

        subjob = job_record.subjobs.first
        expect(subjob.status).to eq('failed')
        expect(subjob.error_messages).to include('Import failed: Import failed due to invalid CSV format')
      end
    end

    context 'when Skills::GenerateEmbedding fails' do
      before do
        stub_wisper_publisher('Administration::ImportSkills', :call, :ok, [1, 2, 3])
        stub_wisper_publisher('Skills::GenerateEmbedding', :call, :error, 'OpenAI API rate limit exceeded')
      end

      it 'stores error in parent job but completes it with error' do
        job_record = nil

        perform_enqueued_jobs do
          expect do
            job_record = AdminJob.call(:import_skills, { owner_id: owner.id, project_id: project.id }, user)
          end.to change { AdminJobRecord.count }.by(3) # parent + 2 subjobs
        end

        job_record.reload
        expect(job_record.status).to eq('completed')
        expect(job_record.error_messages).to include('Embedding generation failed: OpenAI API rate limit exceeded')

        # First subjob should be completed
        import_subjob = job_record.subjobs.find_by(step: 'import')
        expect(import_subjob.status).to eq('completed')

        # Second subjob should be failed but parent job is still completed
        embedding_subjob = job_record.subjobs.find_by(step: 'generate_embeddings')
        expect(embedding_subjob.status).to eq('failed')
        expect(embedding_subjob.error_messages).
          to include('Embedding generation failed: OpenAI API rate limit exceeded')
      end
    end

    context 'when both steps pass successfully' do
      let(:imported_skill_ids) { [1, 2, 3] }

      before do
        stub_wisper_publisher('Administration::ImportSkills', :call, :ok, imported_skill_ids)
        stub_wisper_publisher('Skills::GenerateEmbedding', :call, :ok, true)
      end

      it 'successfully completes the job' do
        job_record = nil

        perform_enqueued_jobs do
          expect do
            job_record = AdminJob.call(:import_skills, { owner_id: owner.id, project_id: project.id }, user)
          end.to change { AdminJobRecord.count }.by(3) # parent + 2 subjobs
        end

        job_record.reload
        expect(job_record.status).to eq('completed')
        expect(job_record.error_messages).to be_empty
        expect(job_record.data['imported_skill_ids']).to eq(imported_skill_ids)

        # Both subjobs should be completed
        import_subjob = job_record.subjobs.find_by(step: 'import')
        expect(import_subjob.status).to eq('completed')

        embedding_subjob = job_record.subjobs.find_by(step: 'generate_embeddings')
        expect(embedding_subjob.status).to eq('completed')
      end

      it 'passes imported skill IDs from import step to embeddings step' do
        job_record = nil

        perform_enqueued_jobs do
          job_record = AdminJob.call(:import_skills, { owner_id: owner.id, project_id: project.id }, user)
        end

        job_record.reload
        expect(job_record.data['imported_skill_ids']).to eq(imported_skill_ids)

        # Check that the embedding subjob receives the skill IDs through parent
        embedding_subjob = job_record.subjobs.find_by(step: 'generate_embeddings')
        expect(embedding_subjob.parent_job.data['imported_skill_ids']).to eq(imported_skill_ids)
      end
    end

    context 'when an unexpected exception occurs' do
      before do
        allow(Administration::ImportSkills).to receive(:new).and_raise(StandardError.new('Unexpected error'))
      end

      it 'handles the exception and fails the job' do
        job_record = nil

        perform_enqueued_jobs do
          expect do
            job_record = AdminJob.call(:import_skills, { owner_id: owner.id, project_id: project.id }, user)
          end.to change { AdminJobRecord.count }.by(2)
        end

        job_record.reload
        expect(job_record.status).to eq('failed')
        expect(job_record.error_messages).to include('Unexpected error')

        subjob = job_record.subjobs.first
        expect(subjob.status).to eq('failed')
        expect(subjob.error_messages).to include('Unexpected error')
      end
    end
  end

  describe 'steps configuration' do
    it 'has exactly 2 steps defined' do
      expect(described_class.steps.length).to eq(2)
    end

    it 'has the correct step names' do
      step_names = described_class.steps.map { |s| s[:name] }
      expect(step_names).to eq(%i[import generate_embeddings])
    end

    it 'has the correct step classes' do
      step_classes = described_class.steps.map { |s| s[:klass] }
      expect(step_classes).to eq([
        AdminJobSteps::ImportSkills::ImportJob,
        AdminJobSteps::ImportSkills::GenerateEmbeddingsJob
      ])
    end
  end
end
