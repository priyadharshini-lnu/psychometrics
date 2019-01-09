# frozen_string_literal: true

require 'rails_helper'

describe Reports::BuildResults do
  context '.call' do
    let(:report)           { double('report', data_configuration: data_configuration, id: 1) }
    let(:client)           { double('client') }
    let(:norm)             { double('norm', id: 1) }
    let(:factors_norm)     { double('factors_norm') }
    let(:membership)       { double('membership', user: user) }
    let(:user)             { double('user', first_name: 'Jon', last_name: 'Snow') }
    let(:assigns_report)   { double('assigns_report') }
    let(:aliases)          { double('aliases') }
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
                       aliases: aliases,
                       factors_norms: [factors_norm])
    end

    let(:build_results_command) { described_class.new(report, [assign]) }

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
      allow(aliases).to  receive(:find_by).and_return(nil)
    end

    context 'UserData' do
      let(:data) { { 'key' => 'first_name', 'label' => 'First Name' } }
      subject { Reports::ResultTypes::UserData.call(build_results_command, data) }

      it { is_expected.to eq(key: 'first_name', name: 'First Name', value: user.first_name) }
      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'
          is_expected.to eq(key: 'not_exists', name: 'First Name', value: nil)
        end
      end
    end

    context 'ExternalResults' do
      let(:data) { { 'key' => 'ed.attempted', 'assessmentId' => 1, 'label' => 'Attempted' } }
      subject { Reports::ResultTypes::ExternalResults.call(build_results_command, data) }

      it { is_expected.to eq(key: 'ed.attempted', name: 'Attempted', value: external_results['ed.attempted']) }

      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'
          is_expected.to eq(key: 'not_exists', name: 'Attempted', value: nil)
        end
        it do
          data['assessmentId'] = 'not_exists'
          is_expected.to eq(key: 'ed.attempted', name: 'Attempted', value: nil)
        end
      end
    end

    context 'NormedFactor' do
      let(:data) { { 'assessmentId' => 1, 'factorId' => 1 } }
      subject { Reports::ResultTypes::NormedFactor.call(build_results_command, data) }

      it do
        expect(factors_norm).to receive(:detect_normed_result).with(scoring['1']['results'])
        is_expected.to eq(key: 1, name: 'Test factor', value: 3)
      end

      it 'collect sub_factors results' do
        allow(factor).to receive(:id).and_return(-1)
        expect(factors_norm).to receive(:detect_normed_result).with(scoring['2']['results'])
        is_expected.to eq(key: 1, name: 'Test factor', value: 3)
      end

      it 'assessment ID not exists' do
        data['assessmentId'] = 'not_exists'
        is_expected.to eq(key: 1, name: 'Test factor', value: nil)
      end

      it 'assign#norm_data is nil' do
        allow(assign).to receive(:norm_data).and_return(nil)
        is_expected.to eq(key: 1, name: 'Test factor', value: nil)
      end
      it 'factor is not exists' do
        allow(Factor).to receive(:find).and_raise(ActiveRecord::RecordNotFound)
        is_expected.to eq(key: 1, name: nil, value: nil)
      end
      it 'factors_norms is not exists' do
        allow(FactorsNorm).to receive(:find_by!).and_raise(ActiveRecord::RecordNotFound)
        is_expected.to eq(key: 1, name: 'Test factor', value: nil)
      end
    end

    context 'Formula' do
      let(:data) { {} }
      subject { Reports::ResultTypes::Formula.call(build_results_command, data) }

      it 'data is blank' do
        is_expected.to eq(key: nil, name: nil, value: nil)
      end

      context 'normal flow' do
        before(:each) do
          allow(data).to receive(:dig).with('formula', 'args').and_return([{ 'type' => 'normed_factor' }])
          allow(Reports::ResultTypes::NormedFactor).to receive(:call).and_return({ value: [1, 2, 3] })
        end
        it 'AVERAGE' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('AVERAGE')
          is_expected.to eq(key: nil, name: nil, value: 2.0)
        end

        it 'MIN' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MIN')
          is_expected.to eq(key: nil, name: nil, value: 1)
        end

        it 'MAX' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MAX')
          is_expected.to eq(key: nil, name: nil, value: 3)
        end

        it 'op is wrong' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('wrong')
          expect { is_expected }.to raise_error(RuntimeError)
        end
      end
    end
  end
end
