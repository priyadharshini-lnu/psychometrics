# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProficiencyLevel, type: :model do
  describe 'scopes' do
    describe '.filterable_fields' do
      let(:project) { Project.find(create(:project).id) }
      let(:skill1) { create(:skill, name: 'Ruby Programming', project: project) }
      let(:skill2) { create(:skill, name: 'Python Programming', project: project) }
      let(:skill3) { create(:skill, name: 'Leadership', project: project) }

      let!(:proficiency_level1) do
        create(:proficiency_level,
               proficiency_type: 'default',
               skill_type: 'technical',
               skill: skill1,
               project: project)
      end

      let!(:proficiency_level2) do
        create(:proficiency_level,
               proficiency_type: 'by_skill_type',
               skill_type: 'technical',
               skill: skill2,
               project: project)
      end

      let!(:proficiency_level3) do
        create(:proficiency_level,
               proficiency_type: 'by_skill',
               skill_type: 'behavioral',
               skill: skill3,
               project: project)
      end

      it 'filters by proficiency_type' do
        result = described_class.filterable_fields('default')
        expect(result).to include(proficiency_level1)
        expect(result).not_to include(proficiency_level2, proficiency_level3)
      end

      it 'filters by skill_type' do
        result = described_class.filterable_fields('technical')
        expect(result).to include(proficiency_level1, proficiency_level2)
        expect(result).not_to include(proficiency_level3)
      end

      it 'filters by skill name' do
        result = described_class.filterable_fields('Ruby')
        expect(result).to include(proficiency_level1)
        expect(result).not_to include(proficiency_level2, proficiency_level3)
      end

      it 'is case insensitive' do
        result = described_class.filterable_fields('ruby')
        expect(result).to include(proficiency_level1)
        expect(result).not_to include(proficiency_level2, proficiency_level3)
      end

      it 'matches partial strings' do
        result = described_class.filterable_fields('Program')
        expect(result).to include(proficiency_level1, proficiency_level2)
        expect(result).not_to include(proficiency_level3)
      end
    end
  end
end
