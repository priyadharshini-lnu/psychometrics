# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessment, type: :model do
  it { should validate_presence_of(:type) }
  it { should validate_inclusion_of(:type).in_array(Assessment::TYPES.values) }

  describe '#saville?' do
    it 'returns true for saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:saville])

      expect(assessment.saville?).to eq(true)
    end

    it 'returns false for non saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.saville?).to eq(false)
    end
  end

  describe '#mettl' do
    it 'returns true for mettl assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:mettl])

      expect(assessment.mettl?).to eq(true)
    end

    it 'returns false for non mettl assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.mettl?).to eq(false)
    end
  end

  describe '#simulation' do
    it 'returns true for simulation assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:simulation])

      expect(assessment.simulation?).to eq(true)
    end

    it 'returns false for non simulation assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.simulation?).to eq(false)
    end
  end

  describe '#external?' do
    external_types = %i[mindmill hogan saville pearson iiht mettl simulation]

    external_types.each do |type|
      it "returns true for #{type} assessment" do
        assessment = build(:assessment, type: Assessment::TYPES[type])

        expect(assessment.external?).to eq(true)
      end
    end

    it 'returns false for non-external assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.external?).to eq(false)
    end
  end

  describe '#external_assessment_name' do
    context 'when assessment type is common' do
      it 'returns nil' do
        assessment = build(:assessment)

        expect(assessment.external_assessment_name).to be_nil
      end
    end

    context 'when external_assessment_id is nil' do
      it 'returns nil' do
        assessment = build(:assessment, type: Assessment::TYPES[:saville])

        expect(assessment.external_assessment_name).to be_nil
      end
    end

    context 'when assessment type is hogan' do
      before do
        allow(Settings.providers.hogan.assessments).to receive(:find).and_return(Struct.new(:name).new(
                                                                                   'HPI'
                                                                                 ))
      end

      let(:hogan_assessment) { create(:hogan_assessment) }

      it 'returns the assessment name' do
        expect(hogan_assessment.external_assessment_name).to eq('HPI')
      end
    end

    context 'when assessment type is simulation' do
      let(:simulation) { create(:assessment, :simulation, external_settings: { assessment_id: 'mte-apply' }) }

      it 'returns the assessment name' do
        expect(simulation.external_assessment_name).to eq('MTE Apply')
      end
    end

    context 'when assessment type is saville' do
      before do
        allow(Settings.providers.saville.assessments).to receive(:find).
          and_return(Struct.new(:name).new('Abstract Reasoning Aptitude-Rx (IA)'))
      end

      let(:saville_assessment) { create(:assessment, :saville) }

      it 'returns the assessment name' do
        expect(saville_assessment.external_assessment_name).to eq('Abstract Reasoning Aptitude-Rx (IA)')
      end
    end

    context 'when assessment type is pearson' do
      let(:pearson_assessment) { create(:assessment, :pearson) }

      before do
        create(:pearson_assessment, product_id: pearson_assessment.external_assessment_id, title: 'Pearson Assessment')
      end

      it 'returns the assessment title' do
        expect(pearson_assessment.external_assessment_name).to eq('Pearson Assessment')
      end
    end

    context 'when assessment type is iiht' do
      let(:iiht_assessment) { create(:assessment, :iiht) }

      before do
        allow(Iiht::GetAssessments).to receive(:call!).
          and_return([
            { 'assessmentIdNumber' => iiht_assessment.external_assessment_id,
              'name' => 'assessment_name' }
          ])
      end

      it 'returns the assessment name' do
        expect(iiht_assessment.external_assessment_name).to eq('assessment_name')
      end
    end

    context 'when assessment type is mettl' do
      let(:mettl_assessment) { create(:assessment, :mettl) }

      before do
        create(:mettl_assessment, product_id: mettl_assessment.external_assessment_id, name: 'Mettl Assessment')
      end

      it 'returns the assessment title' do
        expect(mettl_assessment.external_assessment_name).to eq('Mettl Assessment')
      end
    end

    describe 'create_mettl_schedule' do
      let(:mettl_assessment) { build(:assessment, :mettl) }

      it 'enqueues Mettl::CreateScheduleJob' do
        expect(Mettl::CreateScheduleJob).to receive(:perform_later).with(mettl_assessment)

        mettl_assessment.save!
      end

      it 'does not enqueue Mettl::CreateScheduleJob for non-mettl assessment' do
        non_mettl_assessment = build(:assessment, :hogan)

        expect(Mettl::CreateScheduleJob).not_to receive(:set)

        non_mettl_assessment.save!
      end
    end

    describe 'set_mettl_assessment_return_url' do
      let(:mettl_assessment) { build(:assessment, :mettl) }

      it 'enqueues Mettl::SetMettlAssessmentReturnUrlJob' do
        expect(Mettl::SetMettlAssessmentReturnUrlJob).to receive(:perform_later).
          with(mettl_assessment.external_assessment_id)

        mettl_assessment.save!
      end

      it 'does not enqueue Mettl::SetMettlAssessmentReturnUrlJob for non-mettl assessment' do
        non_mettl_assessment = build(:assessment, :hogan)

        expect(Mettl::SetMettlAssessmentReturnUrlJob).not_to receive(:set)

        non_mettl_assessment.save!
      end
    end

    describe '#simulation_settings' do
      let(:external_assessment_id) { 'mte-apply' }
      let(:assessment) do
        create(:assessment, :simulation, external_settings: { assessment_id: external_assessment_id })
      end

      let(:simulation_settings) { { id: external_assessment_id, name: 'Simulation Assessment' } }

      it 'returns the simulation settings' do
        expect(assessment.simulation_settings.id).to eq(external_assessment_id)
      end
    end
  end
end
