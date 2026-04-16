# frozen_string_literal: true

module AI
  module ContentAnalysis
    class CitationTimestampMatcher
      include Concerns::TextNormalization

      def self.call(citations, segments)
        return citations if citations.blank? || segments.blank?

        normalized_segments = preprocess_segments(segments)
        citations.map { |citation| enrich_with_timestamps(citation, normalized_segments) }
      end

      def self.enrich_with_timestamps(citation, normalized_segments)
        normalized_text = normalize(citation['text'])
        return citation if normalized_text.blank?

        single_match = best_single_match(normalized_text, normalized_segments)
        spanning_match = best_spanning_match(normalized_text, normalized_segments)
        top_match = [single_match, spanning_match].compact.max_by { |match| match[:score] }
        return citation unless top_match

        citation.merge(
          'start_time' => top_match[:start], 'end_time' => top_match[:end],
          'match_score' => top_match[:score].round(3)
        )
      end

      def self.best_single_match(normalized_text, segments)
        top_match = nil

        segments.each do |segment|
          score = compute_overlap(normalized_text, segment[:norm])
          next unless score >= MIN_SCORE
          next if top_match && score <= top_match[:score]

          top_match = { start: segment[:start], end: segment[:end], score: score }
        end

        top_match
      end

      def self.best_spanning_match(normalized_text, segments)
        top_match = nil

        (2..MAX_WINDOW).each do |window_size|
          segments.each_cons(window_size) do |window|
            joiner = no_space_script?(normalized_text) ? '' : ' '
            combined_text = window.map { |segment| segment[:norm] }.join(joiner)
            score = compute_overlap(normalized_text, combined_text)
            next unless score >= SPANNING_MIN_SCORE
            next if top_match && score <= top_match[:score]

            top_match = { start: window.first[:start], end: window.last[:end], score: score }
          end
        end

        top_match
      end

      private_class_method :enrich_with_timestamps, :best_single_match, :best_spanning_match
    end
  end
end
