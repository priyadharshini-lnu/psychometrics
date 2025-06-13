# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::TagsSearch do
  let(:project) { Project.find(create(:project).id) }
  let(:other_project) { Project.find(create(:project).id) }
  let(:scope) { Skill.all }

  describe '#call' do
    let!(:global_skill) do
      skill = create(:skill, name: 'Ruby Programming', skill_type: 'technical', project: nil)
      skill.tag_list.add('programming', 'backend')
      skill.save!
      skill
    end

    let!(:project_skill) do
      skill = create(:skill, name: 'Leadership', skill_type: 'behavioral', project: project)
      skill.tag_list.add('soft-skills', 'management')
      skill.save!
      skill
    end

    let!(:other_project_skill) do
      skill = create(:skill, name: 'Python Programming', skill_type: 'technical', project: other_project)
      skill.tag_list.add('programming', 'scripting')
      skill.save!
      skill
    end

    context 'with name_cont filter' do
      it 'returns tags matching the name' do
        search = described_class.new(scope, { name_cont: 'program' })
        results = search.call

        expect(results.map(&:name)).to include('programming')
        expect(results.map(&:name)).not_to include('soft-skills')
      end
    end

    context 'with project_id_eq filter' do
      it 'returns tags from skills in the specified project' do
        search = described_class.new(scope, { project_id_eq: project.id })
        results = search.call

        expect(results.map(&:name)).to include('soft-skills', 'management')
        expect(results.map(&:name)).not_to include('programming', 'backend')
      end
    end

    context 'with skill_type_in filter' do
      it 'returns tags from skills matching any of the skill types' do
        search = described_class.new(scope, { skill_type_in: %w[technical behavioral] }, all: true)
        results = search.call

        expect(results.map(&:name)).to include('programming', 'backend', 'soft-skills', 'management')
      end

      it 'returns tags from skills matching a single skill_type' do
        search = described_class.new(scope, { skill_type_in: ['technical'] })
        results = search.call

        expect(results.map(&:name)).to include('programming', 'backend')
        expect(results.map(&:name)).not_to include('soft-skills', 'management')
      end
    end

    context 'with all parameter' do
      it 'returns all tags when true' do
        search = described_class.new(scope, {}, all: true)
        results = search.call

        expect(results.map(&:name)).to include('programming', 'backend', 'soft-skills', 'management', 'scripting')
      end

      it 'returns only tags from global skills when false' do
        search = described_class.new(scope, {}, all: false)
        results = search.call

        expect(results.map(&:name)).to include('programming', 'backend')
        expect(results.map(&:name)).not_to include('soft-skills', 'management', 'scripting')
      end
    end

    context 'with combined filters' do
      it 'applies all filters correctly' do
        search = described_class.new(
          scope,
          {
            name_cont: 'program',
            skill_type_in: ['technical'],
            project_id_eq: nil
          }
        )
        results = search.call

        expect(results.map(&:name)).to include('programming')
        expect(results.map(&:name)).not_to include('soft-skills', 'management', 'backend', 'scripting')
      end

      it 'applies filters with integer skill_types' do
        search = described_class.new(
          scope,
          {
            name_cont: 'script',
            skill_type_in: [1], # technical
            project_id_eq: other_project.id
          }
        )
        results = search.call

        expect(results.map(&:name)).to include('scripting')
        expect(results.map(&:name)).not_to include('programming', 'backend', 'soft-skills', 'management')
      end
    end
  end
end
