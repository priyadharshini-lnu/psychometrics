# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skills::GetProficiencyLevel do
  let(:project) { create(:project) }
  let(:skill) { create(:skill, skill_type: 'behavioral', project: Project.find(project.id)) }

  describe '#call' do
    subject(:call_command) { described_class.call(skill) }

    context 'when project-level by_skill proficiency level exists' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: project.id, skill_id: skill.id, proficiency_type: 'by_skill')
      end

      it 'broadcasts the correct level' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when project-level by_category proficiency level exists and by_skill does not' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: project.id, skill_category: skill.skill_type,
        proficiency_type: 'by_category')
      end

      it 'falls back to by_category and broadcasts' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when project-level all_skills proficiency level exists and others don’t' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: project.id, proficiency_type: 'all_skills')
      end

      it 'falls back to all_skills and broadcasts' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when no project-level, but global by_skill proficiency exists' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: nil, skill_id: skill.id, proficiency_type: 'by_skill')
      end

      it 'returns the global by_skill proficiency level' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when no project-level or global by_skill, but global by_category exists' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: nil, skill_category: skill.skill_type, proficiency_type: 'by_category')
      end

      it 'returns the global by_category level' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when only global all_skills proficiency level exists' do
      let!(:proficiency_level) do
        create(:proficiency_level, project_id: nil, proficiency_type: 'all_skills')
      end

      it 'returns the global all_skills level' do
        expect { call_command }.to broadcast(:ok, proficiency_level: proficiency_level)
      end
    end

    context 'when no matching proficiency levels exist at all' do
      it 'does broadcast nil' do
        expect { call_command }.to broadcast(:ok, proficiency_level: nil)
      end
    end
  end
end
