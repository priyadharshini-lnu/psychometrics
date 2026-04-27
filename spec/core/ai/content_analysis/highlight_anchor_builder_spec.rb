# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::ContentAnalysis::HighlightAnchorBuilder do
  describe '.call' do
    context 'with empty input' do
      it 'returns empty when citations are blank' do
        segments = [{ 'start_time' => 0.0, 'end_time' => 5.0, 'text' => 'Hello world.' }]
        expect(described_class.call([], segments)).to eq([])
      end

      it 'returns empty when segments are blank' do
        citations = [{ 'text' => 'hello', 'sentiment' => 'positive' }]
        expect(described_class.call(citations, [])).to eq([])
      end

      it 'returns empty when both are nil' do
        expect(described_class.call(nil, nil)).to eq([])
      end
    end

    context 'exact substring match' do
      it 'highlights only the cited portion, not the full segment' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 5.0,
            'text' => 'The project is going well and we are happy.' }
        ]
        citations = [{ 'text' => 'project is going well', 'sentiment' => 'positive' }]

        anchors = described_class.call(citations, segments)

        expect(anchors.size).to eq(1)
        highlighted = segments[0]['text'][anchors[0]['start_char']...anchors[0]['end_char']]
        expect(highlighted).to eq('project is going well')
        expect(anchors[0]['segment_index']).to eq(0)
        expect(anchors[0]['sentiment']).to eq('positive')
      end
    end

    context 'citation starting mid-segment' do
      it 'sets start_char after the non-cited prefix' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 10.0,
            'text' => "There was a time early in my career when I played a pivotal role. The person, let's call her Sarah, was a brilliant analyst." } # rubocop:disable Layout/LineLength
        ]
        citations = [
          { 'text' => "The person, let's call her Sarah, was a brilliant analyst.",
            'sentiment' => 'positive' }
        ]

        anchors = described_class.call(citations, segments)
        expect(anchors.size).to eq(1)
        expect(anchors[0]['start_char']).to be > 0

        highlighted = segments[0]['text'][anchors[0]['start_char']...anchors[0]['end_char']]
        expect(highlighted).to include('The')
        expect(highlighted).to include('analyst')
        expect(highlighted).not_to include('pivotal role')
      end
    end

    context 'trailing punctuation' do
      it 'includes trailing period since tokenizer captures it with the word' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 5.0,
            'text' => 'She completed all her projects.' }
        ]
        citations = [{ 'text' => 'completed all her projects', 'sentiment' => 'positive' }]

        anchors = described_class.call(citations, segments)
        highlighted = segments[0]['text'][anchors[0]['start_char']...anchors[0]['end_char']]
        expect(highlighted).to eq('completed all her projects.')
      end

      it 'does not extend into the next word' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 5.0,
            'text' => 'Good work on the reports today' }
        ]
        citations = [{ 'text' => 'Good work', 'sentiment' => 'positive' }]

        anchors = described_class.call(citations, segments)
        highlighted = segments[0]['text'][anchors[0]['start_char']...anchors[0]['end_char']]
        expect(highlighted).to eq('Good work')
      end
    end

    context 'overlapping positive and negative citations' do
      it 'splits into distinct regions with mixed sentiment in overlap zone' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 10.0,
            'text' => 'The person was a brilliant analyst, but she often kept her ideas to herself.' }
        ]
        citations = [
          { 'text' => 'The person was a brilliant analyst, but she often kept her ideas to herself.',
            'sentiment' => 'positive' },
          { 'text' => 'she often kept her ideas to herself', 'sentiment' => 'negative' }
        ]

        anchors = described_class.call(citations, segments)
        positive_anchors = anchors.select { |a| a['sentiment'] == 'positive' }
        mixed_anchors = anchors.select { |a| a['sentiment'] == 'mixed' }

        expect(positive_anchors).not_to be_empty
        expect(mixed_anchors).not_to be_empty
      end
    end

    context 'unrelated citation text' do
      it 'returns no anchors' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 5.0, 'text' => 'The weather is nice today.' }
        ]
        citations = [{ 'text' => 'completely unrelated text about dogs', 'sentiment' => 'neutral' }]

        expect(described_class.call(citations, segments)).to be_empty
      end
    end

    context 'cross-segment citation' do
      let(:segments) do
        [
          { 'start_time' => 0.0, 'end_time' => 4.0,
            'text' => 'I explained how it would actually save time by' },
          { 'start_time' => 4.0, 'end_time' => 8.0,
            'text' => 'reducing repeated follow ups and confusion for the team.' }
        ]
      end
      let(:citations) do
        [{ 'text' => 'save time by reducing repeated follow ups and confusion', 'sentiment' => 'positive' }]
      end

      it 'produces anchors for both segments' do
        anchors = described_class.call(citations, segments)
        highlighted_segments = anchors.pluck('segment_index').uniq

        expect(highlighted_segments).to include(0, 1)
      end

      it 'highlights only the matching tail of the first segment' do
        anchors = described_class.call(citations, segments)
        first_anchor = anchors.find { |a| a['segment_index'] == 0 }

        expect(first_anchor['start_char']).to be > 0
        highlighted = segments[0]['text'][first_anchor['start_char']...first_anchor['end_char']]
        expect(highlighted.downcase).to include('save')
      end

      it 'highlights only the matching head of the last segment' do
        anchors = described_class.call(citations, segments)
        last_anchor = anchors.find { |a| a['segment_index'] == 1 }

        highlighted = segments[1]['text'][last_anchor['start_char']...last_anchor['end_char']]
        expect(highlighted.downcase).to include('reducing')
        expect(highlighted.downcase).to include('confusion')
      end
    end

    context 'near-similar (paraphrased) citation' do
      it 'highlights the best matching span, not the full segment' do
        segments = [
          { 'start_time' => 0.0, 'end_time' => 6.0,
            'text' => 'I took feedback from them and made the format very simple and easy to update.' }
        ]
        citations = [
          { 'text' => 'took feedback and made format simple and easy to update', 'sentiment' => 'positive' }
        ]

        anchors = described_class.call(citations, segments)

        expect(anchors).not_to be_empty
        highlighted = segments[0]['text'][anchors.first['start_char']...anchors.first['end_char']]
        expect(highlighted.downcase).to include('feedback')
        expect(highlighted.downcase).to include('update')
        expect(anchors.first['start_char']).to be > 0
      end
    end
  end
end
