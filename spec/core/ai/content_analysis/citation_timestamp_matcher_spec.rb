# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::ContentAnalysis::CitationTimestampMatcher do
  describe '.call' do
    context 'with empty input' do
      it 'returns citations unchanged when segments are empty' do
        citations = [{ 'text' => 'hello' }]
        expect(described_class.call(citations, [])).to eq(citations)
      end

      it 'returns citations unchanged when citations are empty' do
        expect(described_class.call([], [{ 'start_time' => 0, 'end_time' => 1, 'text' => 'hi' }])).to eq([])
      end

      it 'returns citations unchanged when both are nil' do
        expect(described_class.call(nil, nil)).to be_nil
      end
    end

    context 'single segment exact match' do
      it 'matches a citation to the correct segment' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'The project is going well overall.' },
          { 'start_time' => 3.5, 'end_time' => 7.0, 'text' => 'But we need more resources and time.' },
          { 'start_time' => 7.5, 'end_time' => 10.0, 'text' => 'The team is very motivated though.' }
        ]

        citations = [
          { 'text' => 'need more resources and time', 'sentiment' => 'negative' },
          { 'text' => 'team is very motivated', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        # Citation 1 → Segment 2
        expect(result[0]['start_time']).to eq(3.5)
        expect(result[0]['end_time']).to eq(7.0)
        expect(result[0]['match_score']).to be > 0.55

        # Citation 2 → Segment 3
        expect(result[1]['start_time']).to eq(7.5)
        expect(result[1]['end_time']).to eq(10.0)
        expect(result[1]['match_score']).to be > 0.55
      end
    end

    context 'cross-segment spanning match' do
      it 'matches a citation that spans two segments' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'I really think that the new' },
          { 'start_time' => 3.1, 'end_time' => 6.0, 'text' => 'dashboard feature is absolutely great.' },
          { 'start_time' => 6.5, 'end_time' => 9.0, 'text' => 'But the login flow is confusing.' }
        ]

        citations = [
          { 'text' => 'the new dashboard feature is absolutely great', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        # Should span segment 1 + 2
        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(6.0)
        expect(result[0]['match_score']).to be > 0.65
      end

      it 'matches a normal single-segment citation alongside a spanning one' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'I really think that the new' },
          { 'start_time' => 3.1, 'end_time' => 6.0, 'text' => 'dashboard feature is absolutely great.' },
          { 'start_time' => 6.5, 'end_time' => 9.0, 'text' => 'But the login flow is confusing.' }
        ]

        citations = [
          { 'text' => 'the new dashboard feature is absolutely great', 'sentiment' => 'positive' },
          { 'text' => 'login flow is confusing', 'sentiment' => 'negative' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(6.0)
        expect(result[1]['start_time']).to eq(6.5)
        expect(result[1]['end_time']).to eq(9.0)
      end
    end

    context 'LLM paraphrasing' do
      it 'matches when most words overlap (above threshold)' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 4.0,
            'text' => 'The candidate demonstrated strong problem solving skills during the exercise.' },
          { 'start_time' => 4.5, 'end_time' => 8.0, 'text' => 'However the communication was unclear at times.' }
        ]

        citations = [
          { 'text' => 'demonstrated strong problem solving skills', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(4.0)
        expect(result[0]['match_score']).to be >= 0.55
      end

      it 'does not match when overlap is below threshold' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 4.0, 'text' => 'The weather today is beautiful and warm.' }
        ]

        citations = [
          { 'text' => 'it is raining cold outside', 'sentiment' => 'negative' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to be_nil
        expect(result[0]['end_time']).to be_nil
      end
    end

    context 'duplicate word handling (tally fix)' do
      it 'correctly scores when citation has duplicate words' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'very good work' },
          { 'start_time' => 3.5, 'end_time' => 6.0, 'text' => 'not so good this time' }
        ]

        citations = [
          { 'text' => 'very very good', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(3.0)

        expect(result[0]['match_score']).to be_within(0.01).of(0.67)
      end
    end

    context 'no match at all' do
      it 'returns citation without timestamps when nothing matches' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'The sky is blue today.' }
        ]

        citations = [
          { 'text' => 'completely unrelated sentence about dogs', 'sentiment' => 'neutral' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to be_nil
        expect(result[0]['end_time']).to be_nil
        expect(result[0]['match_score']).to be_nil

        expect(result[0]['text']).to eq('completely unrelated sentence about dogs')
        expect(result[0]['sentiment']).to eq('neutral')
      end
    end

    context 'citation with empty text' do
      it 'returns citation unchanged' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'Hello world.' }
        ]

        citations = [{ 'text' => '', 'sentiment' => 'positive' }]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to be_nil
      end
    end

    context 'best match selection' do
      it 'picks the segment with the highest overlap score' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'the project is going well' },
          { 'start_time' => 3.5, 'end_time' => 7.0,
            'text' => 'the project is going extremely well and beyond expectations' }
        ]

        citations = [
          { 'text' => 'the project is going well', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(3.0)
        expect(result[0]['match_score']).to eq(1.0)
      end
    end

    context 'arabic text matching' do
      it 'matches Arabic citations to correct segments' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 5.0, 'text' => 'المشروع يسير بشكل جيد ونحن متحمسون' },
          { 'start_time' => 5.5, 'end_time' => 10.0, 'text' => 'لكن نحتاج إلى تحسين التواصل بين الأقسام' }
        ]

        citations = [
          { 'text' => 'المشروع يسير بشكل جيد', 'sentiment' => 'positive' },
          { 'text' => 'نحتاج إلى تحسين التواصل', 'sentiment' => 'negative' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['end_time']).to eq(5.0)
        expect(result[0]['match_score']).to be >= 0.55

        expect(result[1]['start_time']).to eq(5.5)
        expect(result[1]['end_time']).to eq(10.0)
        expect(result[1]['match_score']).to be >= 0.55
      end

      it 'matches when diacritics differ between citation and segment' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 3.0, 'text' => 'الفريق يعمل بجد' }
        ]

        citations = [
          { 'text' => 'الفَريق يَعمَل بِجِدّ', 'sentiment' => 'positive' }
        ]

        result = described_class.call(citations, segments)

        expect(result[0]['start_time']).to eq(0.0)
        expect(result[0]['match_score']).to eq(1.0)
      end
    end
  end
end
