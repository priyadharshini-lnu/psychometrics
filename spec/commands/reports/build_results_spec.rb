# frozen_string_literal: true

require 'rails_helper'

describe Reports::BuildResults do
  describe '.call' do
    let(:report)           { double('report', data_configuration: data_configuration) }
    let(:client)           { double('client') }
    let(:norm)             { double('norm', id: 1) }
    let(:factors_norm)     { double('factors_norm') }
    let(:membership)       { double('membership', user: user) }
    let(:user)             { double('user', first_name: 'Jon', last_name: 'Snow') }
    let(:assigns_report)   { double('assigns_report') }
    let(:assign) do
      double('assign', membership: membership,
                       external_results: external_results,
                       assessment_id: 1,
                       norm_data: norm_data,
                       scoring: scoring)
    end
    let(:factor) do
      double('factor', id: 1,
                       name: 'Test factor',
                       parent_id: nil,
                       sub_factor_ids: [2, 3],
                       factors_norms: [factors_norm])
    end

    let(:build_results_command) { described_class.new(report, client, assign) }

    # ATTRIBUTES
    # Contains data of External Results from Mindmill or Hogan
    let(:external_results) { { 'ed.attempted' => 1, 'ed.correct' => 2 } }
    # Contains Data Configuration for Report
    let(:data_configuration) { YAML.safe_load(file_fixture('reports/data_configuration.yml').read) }
    # Contains Norm data
    let(:norm_data) { { 'id' => 1, 'type' => 'YTI' } }
    # Contains scoring results
    let(:scoring) do
      {
        '1' => { 'results' => [1, 2, 3] },
        '2' => { 'results' => [4, 5, 6] }
      }
    end

    # SUBJECT
    # subject { described_class.new(report, client) }

    before(:each) do
      allow(Report).to        receive(:find).and_return(report)
      allow(Client).to        receive(:find).and_return(client)
      allow(Factor).to        receive(:find).and_return(factor)
      allow(Norm).to          receive(:find).and_return(norm)
      allow(FactorsNorm).to   receive(:find_by!).and_return(factors_norm)
      allow(factors_norm).to  receive(:detect_normed_result).and_return(3)
    end

    context '#user_data' do
      let(:data) { { 'key' => 'first_name' } }
      subject { build_results_command.user_data(assign, data) }

      it { is_expected.to eq(user.first_name) }
      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'
          is_expected.to be_nil
        end
      end
    end

    context '#external_result' do
      let(:data) { { 'key' => 'ed.attempted', 'assessmentId' => 1 } }
      subject { build_results_command.external_result(assign, data) }
      subject { build_results_command.external_result(assign, data) }

      it { is_expected.to eq(external_results['ed.attempted']) }

      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'
          is_expected.to be_nil
        end
        it do
          data['assessmentId'] = 'not_exists'
          is_expected.to be_nil
        end
      end
    end

    context '#normed_factor' do
      let(:data) { { 'assessmentId' => 1, 'factorId' => 1 } }
      subject { build_results_command.normed_factor(assign, data) }

      it do
        expect(factors_norm).to receive(:detect_normed_result).with(scoring['1']['results'])
        subject
      end

      it 'collect sub_factors results' do
        allow(factor).to receive(:id).and_return(-1)
        expect(factors_norm).to receive(:detect_normed_result).with(scoring['2']['results'])
        subject
      end

      it 'assessment ID not exists' do
        data['assessmentId'] = 'not_exists'
        is_expected.to be_nil
      end
      it 'assign#norm_data is nil' do
        allow(assign).to receive(:norm_data).and_return(nil)
        is_expected.to be_nil
      end
      it 'factor is not exists' do
        allow(Factor).to receive(:find).and_raise(ActiveRecord::RecordNotFound)
        is_expected.to be_nil
      end
      it 'norm is not exists' do
        allow(Norm).to receive(:find).and_raise(ActiveRecord::RecordNotFound)
        is_expected.to be_nil
      end
      it 'factors_norms is not exists' do
        allow(FactorsNorm).to receive(:find_by!).and_raise(ActiveRecord::RecordNotFound)
        is_expected.to be_nil
      end
    end

    context '#formula' do
      let(:data) { {} }
      subject { build_results_command.formula(assign, data) }

      it 'data is blank' do
        is_expected.to be_nil
      end

      context 'normal flow' do
        before(:each) do
          allow(data).to receive(:dig).with('formula', 'args').and_return([{ 'type' => 'normed_factor' }])
          allow_any_instance_of(::Reports::BuildResults).to receive(:normed_factor).and_return([1, 2, 3])
        end
        it 'AVERAGE' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('AVERAGE')
          is_expected.to eq(2.0)
        end

        it 'MIN' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MIN')
          is_expected.to eq(1)
        end

        it 'MAX' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MAX')
          is_expected.to eq(3)
        end

        it 'op is wrong' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('wrong')
          expect { is_expected }.to raise_error(RuntimeError)
        end
      end
    end
  end
end
