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
    external_types = %i[hogan saville pearson iiht mettl simulation mhs]

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

    context 'when assessment type is mhs' do
      before do
        allow(Settings.providers.mhs.assessments).to receive(:find).
          and_return(Struct.new(:name).new('EQ-i 2.0'))
      end

      let(:mhs_assessment) { create(:assessment, :mhs) }

      it 'returns the assessment name' do
        expect(mhs_assessment.external_assessment_name).to eq('EQ-i 2.0')
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

  describe 'owner compatibility with dimension' do
    let(:owner_mismatch_message) do
      I18n.t('admin.owner_resource_mismatch',
             child_resource: I18n.t('admin.owner_resource_assessment'),
             parent_resource: I18n.t('admin.owner_resource_dimension'))
    end

    let(:owner_a) { create(:tenancy) }
    let(:owner_b) { create(:tenancy) }

    it 'is invalid when assessment owner differs from dimension owner' do
      dimension = create(:dimension, owner: owner_a)
      assessment = build(:assessment, dimension: dimension, owner: owner_b)

      expect(assessment).not_to be_valid
      expect(assessment.errors[:dimension]).to include(owner_mismatch_message)
    end

    it 'is valid when owner is unchanged after update' do
      dimension = create(:dimension, owner: owner_a)
      assessment = create(:assessment, dimension: dimension, owner: owner_a)

      assessment.name = 'Updated name'

      expect(assessment).to be_valid
    end

    it 'skips compatibility validation when skip_owner_validation is true' do
      dimension = create(:dimension, owner: owner_a)
      assessment = build(:assessment, dimension: dimension, owner: owner_b)
      assessment.skip_owner_validation = true

      expect(assessment).to be_valid
    end
  end
end

describe '#score_validity_period' do
  let(:assessment) { create(:assessment) }
  let(:project) { create(:project) }

  context 'when hogan' do
    it 'returns validity period nil' do
      hogan_assessment = build(:assessment, :hogan, type: Assessment::TYPES[:hogan])

      expect(hogan_assessment.score_validity_period).to eq(nil)
    end
  end

  context 'when project_id is nil' do
    it 'returns the default score validity period' do
      expect(assessment.score_validity_period).to eq(Assessment::DEFAULT_SCORE_VALIDITY_PERIOD)
    end
  end

  context 'when project_id is provided' do
    context 'and project_assessment exists with user_result_validity_in_days' do
      let!(:project_assessment) do
        create(:project_assessment, assessment: assessment, project: project, user_result_validity_in_days: 30.days)
      end

      it 'returns the user_result_validity_in_days from project_assessment' do
        expect(assessment.score_validity_period(project_id: project.id)).to eq(30.days)
      end
    end

    context 'and project_assessment does not exist' do
      it 'returns the default score validity period' do
        expect(assessment.score_validity_period(project_id: project.id)).
          to eq(Assessment::DEFAULT_SCORE_VALIDITY_PERIOD)
      end
    end
  end
end
