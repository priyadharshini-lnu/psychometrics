# frozen_string_literal: true

require 'rails_helper'

describe ReflectionQuestions::Import do
  let!(:project) { create(:project) }

  let(:csv) do
    [{
      'ID' => nil,
      'Mandatory' => 'yes',
      'MinWords' => 10,
      'MaxWords' => 100,
      'English / en' => 'English question text',
      'English / ar' => 'Arabic question text'
    }]
  end

  let(:file) { double('file', url: 'http://example.com/file.csv') }

  describe '#call' do
    context 'with valid data' do
      before do
        allow(CsvFileParser).to receive(:call!).with(file, headers: true).and_return(csv)
      end

      it 'creates new reflection questions' do
        import = described_class.new(file, project.id)

        expect { import.call }.to change(ReflectionQuestion, :count).by(1)
      end

      it 'returns success status' do
        import = described_class.new(file, project.id)
        result = import.call

        expect(result).to be true
      end
    end

    context 'with same questions id' do
      it 'override existing questions with the same prompt' do
        q = ReflectionQuestion.create(question: 'test', project_id: project.id)
        allow(CsvFileParser).to receive(:call!).with(file, headers: true).and_return([{
          'ID' => q.id,
          'Mandatory' => 'yes',
          'MinWords' => 10,
          'MaxWords' => 100,
          'English / en' => 'English question text',
          'English / ar' => 'Arabic question text'
        }])
        import = described_class.new(file, project.id)
        expect { import.call }.not_to change(ReflectionQuestion, :count)
        expect(q.reload.question).to eq('English question text')
      end
    end
  end
end
