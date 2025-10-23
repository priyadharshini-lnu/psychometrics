# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::Base do
  describe 'individual class should define isolated :steps' do
    let(:test_class_one) do
      Class.new(AdminJobs::Base) do
        def self.name
          'TestJob1'
        end

        step :step1, 'SomeClass1', weight: 0.5
        step :step2, 'SomeClass2', weight: 0.5
      end
    end

    let(:test_class_two) do
      Class.new(AdminJobs::Base) do
        def self.name
          'TestJob2'
        end

        step :step_a, 'SomeClassA', weight: 0.3
        step :step_b, 'SomeClassB', weight: 0.7
      end
    end

    let(:test_class_three) do
      Class.new(AdminJobs::Base) do
        def self.name
          'TestJob3'
        end
      end
    end

    let(:mock_record) { double('AdminJobRecord', owner: double('User')) }

    it 'should have separate steps arrays for each subclass' do
      # Each class should have its own steps
      expect(test_class_one.steps.length).to eq(2)
      expect(test_class_two.steps.length).to eq(2)
      expect(test_class_three.steps.length).to eq(0)

      # Steps should contain the correct data
      expect(test_class_one.steps.pluck(:name)).to eq(%i[step1 step2])
      expect(test_class_two.steps.pluck(:name)).to eq(%i[step_a step_b])
    end

    it 'should not share steps arrays between classes' do
      expect(test_class_one.steps.object_id).not_to eq(test_class_two.steps.object_id)
      expect(test_class_one.steps.object_id).not_to eq(test_class_three.steps.object_id)
      expect(test_class_two.steps.object_id).not_to eq(test_class_three.steps.object_id)
    end

    it 'should not affect the base class steps' do
      expect(AdminJobs::Base.steps).to eq([])
      expect(AdminJobs::Base.steps.object_id).not_to eq(test_class_one.steps.object_id)
    end

    it 'should work correctly with instances' do
      instance1 = test_class_one.new(mock_record)
      instance2 = test_class_two.new(mock_record)

      expect(instance1.steps.length).to eq(2)
      expect(instance2.steps.length).to eq(2)
      expect(instance1.steps.pluck(:name)).to eq(%i[step1 step2])
      expect(instance2.steps.pluck(:name)).to eq(%i[step_a step_b])
    end
  end
end
