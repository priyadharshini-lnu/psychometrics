# frozen_string_literal: true

require 'rails_helper'

describe Skills::GenerateEmbedding do
  let(:client) { create(:tenancy) }
  let(:project) { Project.find(create(:project, client: client).id) }
  let(:skills) { create_list(:skill, 5, project: project) }
  let(:skills_query) { Skill.where(id: skills.map(&:id)) }
  let(:job_record) { create(:admin_job_record, operation: :import_skills) }

  before do
    allow_any_instance_of(Skill).to receive(:embedding_text).and_return('Sample embedding text')
    VectorEmbedding.where(resource: skills).destroy_all
    allow(Settings).to receive(:ai_embedding_provider).and_return({
      provider: 'openai',
      api_key: 'test-key',
      api_endpoint: 'https://test-endpoint.openai.azure.com',
      model: 'text-embedding-3-large'
    })
  end

  describe '#call' do
    context 'when embedding service succeeds' do
      let(:mock_vectors) { Array.new(5) { Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1) } }

      before do
        stub_wisper_publisher('AI::EmbeddingService', :call, :ok, mock_vectors)
      end

      it 'sets total tasks on job record' do
        service = described_class.new(skills_query, job_record)

        expect(job_record).to receive(:update!).with(status: :in_progress, total_tasks: 1)

        service.call
      end

      it 'processes all skills and updates embeddings' do
        service = described_class.new(skills_query, job_record)

        expect do
          service.call
        end.to change { skills.map(&:reload).filter_map(&:embedding).count }.from(0).to(5)
      end

      it 'increments completed tasks on job record' do
        service = described_class.new(skills_query, job_record)

        expect(job_record).to receive(:increment_completed_tasks!)

        service.call
      end

      it 'broadcasts ok when all batches complete successfully' do
        service = described_class.new(skills_query, job_record)

        result = nil
        service.on(:ok) { result = :success }
        service.call

        expect(result).to eq(:success)
      end
    end

    context 'when embedding service fails' do
      before do
        stub_wisper_publisher('AI::EmbeddingService', :call, :error, 'OpenAI API rate limit exceeded')
      end

      it 'broadcasts error and stops processing' do
        service = described_class.new(skills_query, job_record)

        result = nil
        service.on(:error) { |error| result = error }
        service.call

        expect(result).to eq('OpenAI API rate limit exceeded')
      end

      it 'does not increment completed tasks when error occurs' do
        service = described_class.new(skills_query, job_record)

        expect(job_record).not_to receive(:increment_completed_tasks!)

        service.call
      end
    end

    context 'with batching' do
      let(:batch_skills) { create_list(:skill, 5, project: project) } # Small test batch
      let(:batch_skills_query) { Skill.where(id: batch_skills.map(&:id)) }

      before do
        allow_any_instance_of(Skills::GenerateEmbedding).to receive(:batch_size).and_return(3)
        stub_wisper_publisher('AI::EmbeddingService', :call, :ok, Array.new(3) do
          Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1)
        end)
      end

      it 'calculates correct total tasks for multiple batches' do
        service = described_class.new(batch_skills_query, job_record)

        # 5 skills / 3 batch size = 2 batches (ceil(5/3) = 2)
        expect(job_record).to receive(:update!).with(status: :in_progress, total_tasks: 2)

        service.call
      end

      it 'processes skills in batches' do
        service = described_class.new(batch_skills_query, job_record)

        # Should call increment_completed_tasks! twice (once per batch)
        expect(job_record).to receive(:increment_completed_tasks!).twice

        service.call
      end

      it 'stops processing remaining batches when one batch fails' do
        stub_wisper_publisher('AI::EmbeddingService', :call, :error, 'API error during batch processing')

        service = described_class.new(batch_skills_query, job_record)

        result = nil
        service.on(:error) { |error| result = error }
        service.call

        expect(result).to eq('API error during batch processing')
      end
    end

    context 'without job record' do
      it 'works without job record for progress tracking' do
        service = described_class.new(skills_query, nil)

        stub_wisper_publisher('AI::EmbeddingService', :call, :ok, Array.new(5) do
          Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1)
        end)

        result = nil
        service.on(:ok) { result = :success }
        service.call

        expect(result).to eq(:success)
      end

      it 'does not attempt to update job record when nil' do
        service = described_class.new(skills_query, nil)

        stub_wisper_publisher('AI::EmbeddingService', :call, :ok, Array.new(5) do
          Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1)
        end)

        expect { service.call }.not_to raise_error
      end
    end
  end

  describe 'batch size limits' do
    it 'calculates total tasks correctly for various skill counts' do
      # Use stub_const to test batch calculation without creating many records
      allow_any_instance_of(Skills::GenerateEmbedding).to receive(:batch_size).and_return(3)

      test_cases = [
        { skill_count: 1, expected_batches: 1 },
        { skill_count: 3, expected_batches: 1 },
        { skill_count: 4, expected_batches: 2 },
        { skill_count: 6, expected_batches: 2 },
        { skill_count: 7, expected_batches: 3 }
      ]

      test_cases.each do |test_case|
        skills_list = create_list(:skill, test_case[:skill_count], project: project)
        query = Skill.where(id: skills_list.map(&:id))
        service = described_class.new(query, job_record)

        expect(job_record).to receive(:update!).with(status: :in_progress, total_tasks: test_case[:expected_batches])

        stub_wisper_publisher('AI::EmbeddingService', :call, :ok, Array.new([test_case[:skill_count], 3].min) do
          Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1)
        end)

        service.call

        skills_list.each(&:destroy)
      end
    end
  end
end
