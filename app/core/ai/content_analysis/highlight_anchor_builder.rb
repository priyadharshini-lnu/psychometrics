# frozen_string_literal: true

module AI
  module ContentAnalysis
    class HighlightAnchorBuilder
      include Concerns::TextNormalization

      def self.call(citations, segments)
        return [] if citations.blank? || segments.blank?

        normalized_segments = preprocess_segments(segments)
        raw_anchors = citations.flat_map { |citation| anchors_for(citation, segments, normalized_segments) }
        merge_overlapping_anchors(raw_anchors)
      end

      def self.anchors_for(citation, segments, normalized_segments)
        normalized_citation = normalize(citation['text'])
        return [] if normalized_citation.blank?

        sentiment = citation['sentiment'] || 'neutral'
        segment_match = best_segment_match(normalized_citation, normalized_segments)
        return [] unless segment_match

        matched_indices = segment_match[:type] == :single ? [segment_match[:index]] : segment_match[:indices]
        matched_indices.filter_map do |segment_index|
          range = char_range(normalized_citation.split, segments[segment_index]['text'])
          next unless range

          { 'segment_index' => segment_index, 'start_char' => range[:start],
            'end_char' => range[:end], 'sentiment' => sentiment }
        end
      end

      def self.best_segment_match(normalized_citation, normalized_segments)
        single_match = best_single_match(normalized_citation, normalized_segments)
        spanning_match = best_spanning_match(normalized_citation, normalized_segments)
        [single_match, spanning_match].compact.max_by { |match| match[:score] }
      end

      def self.best_single_match(normalized_text, segments)
        top_match = nil

        segments.each_with_index do |segment, index|
          score = compute_overlap(normalized_text, segment[:norm])
          next unless score >= MIN_SCORE
          next if top_match && score <= top_match[:score]

          top_match = { index: index, score: score, type: :single }
        end

        top_match
      end

      def self.best_spanning_match(normalized_text, segments)
        top_match = nil

        (2..MAX_WINDOW).each do |window_size|
          segments.each_cons(window_size).with_index do |window, start_index|
            joiner = no_space_script?(normalized_text) ? '' : ' '
            combined_text = window.map { |segment| segment[:norm] }.join(joiner)
            score = compute_overlap(normalized_text, combined_text)
            next unless score >= SPANNING_MIN_SCORE
            next if top_match && score <= top_match[:score]

            top_match = { indices: (start_index...(start_index + window_size)).to_a,
                          score: score, type: :spanning }
          end
        end

        top_match
      end

      # Bidirectional scan: tries forward and backward ordered subsequence matching
      # to find the tightest character range covering the citation words in the segment.
      def self.char_range(citation_words, segment_text)
        segment_tokens = tokenize(segment_text)
        return nil if segment_tokens.empty? || citation_words.empty?

        forward_result = scan_forward(citation_words, segment_tokens)
        backward_result = scan_backward(citation_words, segment_tokens)
        # Pick the scan that matched more words; break ties by tightest span
        best_scan = [forward_result, backward_result].compact.max_by do |result|
          [result[:matched], -(result[:last] - result[:first])]
        end
        return nil unless best_scan

        { start: segment_tokens[best_scan[:first]][:start],
          end: segment_tokens[best_scan[:last]][:end] }
      end

      def self.scan_forward(citation_words, segment_tokens)
        citation_index = 0
        first_token = last_token = nil
        matched_count = 0

        segment_tokens.each_with_index do |token, token_index|
          next unless token[:norm] == citation_words[citation_index]

          first_token ||= token_index
          last_token = token_index
          matched_count += 1
          citation_index += 1
          break if citation_index >= citation_words.length
        end

        first_token ? { first: first_token, last: last_token, matched: matched_count } : nil
      end

      def self.scan_backward(citation_words, segment_tokens)
        citation_index = citation_words.length - 1
        first_token = last_token = nil
        matched_count = 0

        (segment_tokens.length - 1).downto(0) do |token_index|
          next unless segment_tokens[token_index][:norm] == citation_words[citation_index]

          last_token ||= token_index
          first_token = token_index
          matched_count += 1
          citation_index -= 1
          break if citation_index.negative?
        end

        first_token ? { first: first_token, last: last_token, matched: matched_count } : nil
      end

      def self.tokenize(text)
        tokens = []
        text.scan(/\S+/) do |word|
          match_data = Regexp.last_match
          tokens << { norm: normalize(word), start: match_data.begin(0), end: match_data.end(0) }
        end
        tokens
      end

      def self.merge_overlapping_anchors(anchors)
        return anchors if anchors.length <= 1

        anchors.
          group_by { |anchor| anchor['segment_index'] }.
          flat_map { |_, segment_anchors| sweep_merge(segment_anchors) }
      end

      # Sweep-line algorithm: splits overlapping anchors into non-overlapping regions
      # with correct sentiment labels (positive, negative, or mixed when overlapping).
      def self.sweep_merge(segment_anchors)
        return segment_anchors if segment_anchors.length == 1

        events = segment_anchors.flat_map do |anchor|
          [{ pos: anchor['start_char'], type: :open, sentiment: anchor['sentiment'] },
           { pos: anchor['end_char'], type: :close, sentiment: anchor['sentiment'] }]
        end.sort_by { |event| [event[:pos], event[:type] == :open ? 0 : 1] }

        regions = build_sentiment_regions(events, segment_anchors.first['segment_index'])
        merge_consecutive_regions(regions)
      end

      def self.build_sentiment_regions(events, segment_index)
        regions = []
        active_sentiments = Hash.new(0)
        previous_position = nil

        events.each do |event|
          if previous_position && event[:pos] > previous_position && active_sentiments.values.any?(&:positive?)
            active_labels = active_sentiments.select { |_, count| count.positive? }.keys
            label = active_labels.length == 1 ? active_labels.first : 'mixed'
            regions << { 'segment_index' => segment_index, 'start_char' => previous_position,
                         'end_char' => event[:pos], 'sentiment' => label }
          end

          active_sentiments[event[:sentiment]] += event[:type] == :open ? 1 : -1
          previous_position = event[:pos]
        end

        regions
      end

      def self.merge_consecutive_regions(regions)
        return regions if regions.length <= 1

        merged = [regions.first]
        regions[1..].each do |region|
          previous_region = merged.last
          if region['sentiment'] == previous_region['sentiment'] && region['start_char'] == previous_region['end_char']
            previous_region['end_char'] = region['end_char']
          else
            merged << region
          end
        end
        merged
      end

      private_class_method :anchors_for, :best_segment_match, :best_single_match,
                           :best_spanning_match, :char_range, :scan_forward,
                           :scan_backward, :tokenize, :merge_overlapping_anchors,
                           :sweep_merge, :build_sentiment_regions, :merge_consecutive_regions
    end
  end
end
