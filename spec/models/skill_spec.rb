# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skill, type: :model do
  # Association tests
  it { should belong_to(:project).optional }
  it { should have_many(:skills_job_roles) }
  it { should have_many(:job_roles).through(:skills_job_roles) }
  it { should have_many(:skills_development_actions).dependent(:destroy) }
  it { should have_many(:development_actions).through(:skills_development_actions) }
  it { should have_one(:vector_embedding).dependent(:destroy) }

  # Enum tests
  it { should define_enum_for(:skill_type).with_values(behavioral: 0, technical: 1, other: 2, qualification: 3) }

  # Translation tests
  describe 'translations' do
    it 'translates name and description' do
      I18n.with_locale(:en) do
        skill = create(:skill, name_en: 'Leadership', description_en: 'Leadership skills')

        I18n.with_locale(:es) do
          skill.name = 'Liderazgo'
          skill.description = 'Habilidades de liderazgo'
          skill.save
        end

        # Check English translations
        expect(skill.name).to eq('Leadership')
        expect(skill.description).to eq('Leadership skills')

        I18n.with_locale(:es) do
          expect(skill.name).to eq('Liderazgo')
          expect(skill.description).to eq('Habilidades de liderazgo')
        end
      end
    end
  end

  # Scope tests
  describe 'scopes' do
    let!(:project) { Project.find(create(:project).id) }
    let!(:project_skill) { create(:skill, project: project) }
    let!(:global_skill) { create(:skill, project: nil) }
    let!(:other_project_skill) { create(:skill, project: Project.find(create(:project).id)) }

    describe '.global' do
      it 'returns only global skills (without project)' do
        expect(described_class.global).to include(global_skill)
        expect(described_class.global).not_to include(project_skill)
        expect(described_class.global).not_to include(other_project_skill)
      end
    end

    describe '.project_id_eq' do
      it 'returns skills for the specified project' do
        expect(described_class.project_id_eq(project.id)).to include(project_skill)
        expect(described_class.project_id_eq(project.id)).not_to include(global_skill)
        expect(described_class.project_id_eq(project.id)).not_to include(other_project_skill)
      end
    end

    describe '.all_skills' do
      it 'returns all skills' do
        expect(described_class.all_skills).to include(project_skill, global_skill, other_project_skill)
      end
    end
  end

  # Ransack configuration tests
  describe 'ransackable attributes' do
    it 'returns the allowed ransackable attributes' do
      expect(described_class.ransackable_attributes).to match_array(%w[id name skill_type project_id])
    end
  end

  describe 'ransackable associations' do
    it 'returns the allowed ransackable associations' do
      expect(described_class.ransackable_associations).to match_array(%w[job_roles project])
    end
  end

  describe 'ransackable scopes' do
    it 'returns the allowed ransackable scopes' do
      expect(described_class.ransackable_scopes).
        to match_array(%w[all_skills by_project filter_by_skill_type global filterable_fields
                          by_idp_template_id available_skills_by_plan_id])
    end
  end

  # Tagging tests
  describe 'tagging' do
    let(:project) { Project.find(create(:project).id) }
    let(:skill) { create(:skill) }

    it 'can be tagged' do
      skill.tag_list.add('important', 'technical')
      skill.save
      expect(skill.tag_list).to match_array(%w[important technical])
    end

    it 'scopes tags by project' do
      skill.project = project
      skill.tag_list.add('project-specific')
      skill.save
      expect(skill.taggings.first.tenant).to eq(project.id.to_s)
    end
  end

  describe 'embedding generation' do
    let(:embedding_vector) { Array.new(VectorEmbedding::EMBEDDING_DIMENSIONS, 0.1) }

    before do
      stub_wisper_publisher('AI::EmbeddingService', :call, :ok, [embedding_vector])
    end

    describe '#embedding_text_previously_changed?' do
      it 'returns true when name was changed in last save' do
        skill = create(:skill, name: 'Leadership', description: 'Leading teams effectively')
        skill.name = 'New Leadership'
        skill.save!
        expect(skill.send(:embedding_text_previously_changed?)).to be true
      end

      it 'returns true when description was changed in last save' do
        skill = create(:skill, name: 'Leadership', description: 'Leading teams effectively')
        skill.description = 'New description'
        skill.save!
        expect(skill.send(:embedding_text_previously_changed?)).to be true
      end

      it 'returns true when skill_type was changed in last save' do
        skill = create(:skill, name: 'Leadership', description: 'Leading teams effectively')
        skill.skill_type = :technical
        skill.save!
        expect(skill.send(:embedding_text_previously_changed?)).to be true
      end

      it 'returns true when skill_group_id was changed in last save' do
        skill = create(:skill, name: 'Leadership', description: 'Leading teams effectively')
        skill_group = create(:skill_group)
        skill.skill_group = skill_group
        skill.save!
        expect(skill.send(:embedding_text_previously_changed?)).to be true
      end

      it 'returns true for new records' do
        new_skill = build(:skill, name: 'New Skill')
        new_skill.save!
        expect(new_skill.send(:embedding_text_previously_changed?)).to be true
      end

      it 'returns false when no relevant fields changed' do
        skill = create(:skill, name: 'Leadership', description: 'Leading teams effectively')
        skill.created_at = 1.day.ago
        skill.save!
        expect(skill.send(:embedding_text_previously_changed?)).to be false
      end
    end

    describe 'after_save callback' do
      it 'schedules VectorEmbeddingGenerationJob when embedding text changes' do
        expect(VectorEmbeddingGenerationJob).to receive(:perform_later)

        create(:skill, name: 'New Skill', description: 'New Description')
      end

      it 'schedules VectorEmbeddingGenerationJob when name is updated' do
        skill = create(:skill, name: 'Original Name')

        expect(VectorEmbeddingGenerationJob).to receive(:perform_later).with(skill)

        skill.update!(name: 'Updated Name')
      end

      it 'does not schedule job when skip_embedding_generation is set' do
        expect(VectorEmbeddingGenerationJob).not_to receive(:perform_later)

        skill = build(:skill, name: 'Test Skill')
        skill.skip_embedding_generation!
        skill.save!
      end
    end
  end

  describe '#embedding_text' do
    let(:skill_group) { create(:skill_group, name: 'Technical Skills') }
    let(:skill) do
      create(:skill,
             name: 'Ruby Programming',
             description: 'Expert in Ruby language',
             skill_type: :technical,
             skill_group: skill_group)
    end

    before do
      skill.tag_list.add('ruby', 'programming', 'backend')
      skill.save!
    end

    it 'includes all relevant fields in embedding text' do
      embedding_text = skill.embedding_text
      expect(embedding_text).to include('Ruby Programming')
      expect(embedding_text).to include('Expert in Ruby language')
      expect(embedding_text).to include('Technical')
      expect(embedding_text).to include('Technical Skills')
      expect(embedding_text).to include('ruby')
      expect(embedding_text).to include('programming')
      expect(embedding_text).to include('backend')
    end

    it 'handles missing optional fields gracefully' do
      minimal_skill = create(:skill, name: 'Simple Skill', description: nil, skill_type: :technical)
      embedding_text = minimal_skill.embedding_text
      expect(embedding_text).to include('Simple Skill')
      expect(embedding_text).to include('Technical')
      expect(embedding_text).not_to include('Description:')
      expect(embedding_text).not_to include('Group:')
      expect(embedding_text).not_to include('Tags:')
    end

    it 'excludes empty tags' do
      skill_without_tags = create(:skill, name: 'No Tags Skill', description: 'A skill without tags',
        skill_type: :technical)
      embedding_text = skill_without_tags.embedding_text
      expect(embedding_text).to include('No Tags Skill')
      expect(embedding_text).to include('A skill without tags')
      expect(embedding_text).to include('Technical')
      expect(embedding_text).not_to include('Tags:')
    end
  end
end
