# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponses::Transcriptions::SegmentParser do
  describe '.from_azure_words' do
    context 'empty input' do
      it 'returns empty array' do
        expect(described_class.from_azure_words(nil)).to eq([])
        expect(described_class.from_azure_words([])).to eq([])
      end
    end

    context 'punctuation restoration' do
      it 'restores punctuation correctly' do
        words = [
          { 'word' => 'Hey', 'start' => 1.0, 'end' => 1.5 },
          { 'word' => 'how', 'start' => 1.5, 'end' => 2.0 },
          { 'word' => 'are', 'start' => 2.0, 'end' => 2.2 },
          { 'word' => 'you', 'start' => 2.2, 'end' => 2.5 }
        ]

        full_text = 'Hey, how are you?'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments).to eq([
          {
            'start_time' => 1.0,
            'end_time' => 2.5,
            'text' => 'Hey, how are you?'
          }
        ])
      end
    end

    context 'segment duration behavior' do
      it 'does not break sentence when crossing duration threshold' do
        words = [
          { 'word' => 'This', 'start' => 0.0, 'end' => 1.0 },
          { 'word' => 'is', 'start' => 1.0, 'end' => 2.0 },
          { 'word' => 'a', 'start' => 2.0, 'end' => 3.0 },
          { 'word' => 'long', 'start' => 3.0, 'end' => 4.0 },
          { 'word' => 'sentence', 'start' => 4.0, 'end' => 11.0 }
        ]

        full_text = 'This is a long sentence.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(1)
        expect(segments.first['text']).to eq('This is a long sentence.')
      end

      it 'splits after sentence when exceeding duration' do
        words = [
          { 'word' => 'First', 'start' => 0.0, 'end' => 2.0 },
          { 'word' => 'sentence', 'start' => 2.0, 'end' => 4.0 },
          { 'word' => 'Second', 'start' => 5.0, 'end' => 8.0 },
          { 'word' => 'sentence', 'start' => 8.0, 'end' => 12.0 },
          { 'word' => 'Third', 'start' => 13.0, 'end' => 15.0 }
        ]

        full_text = 'First sentence. Second sentence. Third.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(2)

        expect(segments[0]['text']).to eq('First sentence. Second sentence.')
        expect(segments[1]['text']).to eq('Third.')
      end

      it 'does not create tiny segments' do
        words = [
          { 'word' => 'Yes', 'start' => 0.0, 'end' => 0.5 },
          { 'word' => 'No', 'start' => 1.0, 'end' => 1.5 },
          { 'word' => 'Maybe', 'start' => 2.0, 'end' => 2.5 }
        ]

        full_text = 'Yes. No. Maybe.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(1)
        expect(segments.first['text']).to eq('Yes. No. Maybe.')
      end
    end

    context 'edge cases' do
      it 'handles single word' do
        words = [{ 'word' => 'Hello', 'start' => 0.0, 'end' => 0.5 }]
        full_text = 'Hello.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments).to eq([
          { 'start_time' => 0.0, 'end_time' => 0.5, 'text' => 'Hello.' }
        ])
      end

      it 'handles punctuation mismatch gracefully' do
        words = [
          { 'word' => 'youre', 'start' => 0.0, 'end' => 0.5 },
          { 'word' => 'good', 'start' => 0.5, 'end' => 1.0 }
        ]

        full_text = "you're good."

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.first['text']).to include('good')
      end
    end

    context 'arabic text' do
      it 'parses a full Arabic paragraph with correct sentence boundaries' do
        words = [
          { 'word' => 'مرحبا', 'start' => 0.0, 'end' => 0.5 },
          { 'word' => 'بالجميع', 'start' => 0.6, 'end' => 1.2 },
          { 'word' => 'اليوم', 'start' => 1.3, 'end' => 1.8 },
          { 'word' => 'سنتحدث', 'start' => 1.9, 'end' => 2.5 },
          { 'word' => 'عن', 'start' => 2.6, 'end' => 2.8 },
          { 'word' => 'المشروع', 'start' => 2.9, 'end' => 3.5 },
          { 'word' => 'الجديد', 'start' => 3.6, 'end' => 4.0 },
          { 'word' => 'هل', 'start' => 4.2, 'end' => 4.5 },
          { 'word' => 'هناك', 'start' => 4.6, 'end' => 5.0 },
          { 'word' => 'أي', 'start' => 5.1, 'end' => 5.3 },
          { 'word' => 'أسئلة', 'start' => 5.4, 'end' => 6.0 }
        ]

        full_text = 'مرحبا بالجميع. اليوم سنتحدث عن المشروع الجديد. هل هناك أي أسئلة؟'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(1)
        segment_text = segments.first['text']
        expect(segment_text).to include('بالجميع.')
        expect(segment_text).to include('الجديد.')
        expect(segment_text).to include('أسئلة؟')
      end

      it 'splits Arabic sentences into segments at duration boundary' do
        words = [
          { 'word' => 'المشروع', 'start' => 0.0, 'end' => 1.0 },
          { 'word' => 'يسير', 'start' => 1.5, 'end' => 2.5 },
          { 'word' => 'بشكل', 'start' => 3.0, 'end' => 4.0 },
          { 'word' => 'جيد', 'start' => 4.5, 'end' => 6.0 },
          { 'word' => 'ونحن', 'start' => 6.5, 'end' => 8.0 },
          { 'word' => 'متحمسون', 'start' => 8.5, 'end' => 10.5 },
          { 'word' => 'لكن', 'start' => 11.0, 'end' => 12.0 },
          { 'word' => 'نحتاج', 'start' => 12.5, 'end' => 13.0 },
          { 'word' => 'المزيد', 'start' => 13.5, 'end' => 14.5 }
        ]

        full_text = 'المشروع يسير بشكل جيد ونحن متحمسون. لكن نحتاج المزيد.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(2)
        expect(segments[0]['text']).to include('متحمسون.')
        expect(segments[1]['text']).to include('نحتاج')
      end

      it 'handles diacritized Arabic text in punctuation restoration' do
        words = [
          { 'word' => 'الفريق', 'start' => 0.0, 'end' => 0.5 },
          { 'word' => 'يعمل', 'start' => 0.6, 'end' => 1.0 },
          { 'word' => 'بجد', 'start' => 1.1, 'end' => 1.5 }
        ]

        full_text = 'الفَريق يَعمَل بِجِدّ.'

        segments = described_class.from_azure_words(words, full_text)

        expect(segments.size).to eq(1)
        expect(segments.first['text']).to include('بِجِدّ.')
      end
    end
  end
end
