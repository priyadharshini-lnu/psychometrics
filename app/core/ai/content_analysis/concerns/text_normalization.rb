# frozen_string_literal: true

module AI
  module ContentAnalysis
    module Concerns
      module TextNormalization
        extend ActiveSupport::Concern

        ARABIC_DIACRITICS = MediaResponses::Transcriptions::SegmentParser::ARABIC_DIACRITICS
        NO_SPACE_SCRIPT = MediaResponses::Transcriptions::SegmentParser::NO_SPACE_SCRIPT

        # Minimum word-overlap ratio for a citation to match a single segment
        MIN_SCORE = 0.55
        # Higher threshold for multi-segment (spanning) matches to reduce false positives
        SPANNING_MIN_SCORE = 0.65
        # Maximum number of consecutive segments to combine when looking for a spanning match
        MAX_WINDOW = 4

        class_methods do # rubocop:disable Metrics/BlockLength
          def normalize(text)
            text.to_s.
              unicode_normalize(:nfc).
              gsub(ARABIC_DIACRITICS, '').
              downcase.
              gsub(/[^\p{L}\p{N}\s]/, '').
              gsub(/\s+/, ' ').
              strip
          end

          # Computes how much of the citation text is present in segment text.
          def compute_overlap(citation_text, segment_text)
            if no_space_script?(citation_text)
              compute_ngram_overlap(citation_text, segment_text)
            else
              compute_word_overlap(citation_text, segment_text)
            end
          end

          def no_space_script?(text)
            text.match?(NO_SPACE_SCRIPT)
          end

          def preprocess_segments(segments)
            segments.map do |segment|
              {
                start: segment['start_time'],
                end: segment['end_time'],
                norm: normalize(segment['text'])
              }
            end
          end

          private

          def compute_word_overlap(citation_text, segment_text)
            citation_words = citation_text.split
            segment_words = segment_text.split
            return 0.0 if citation_words.empty?

            word_counts = segment_words.tally
            matched_count = citation_words.count do |word|
              if word_counts[word]&.positive?
                word_counts[word] -= 1
                true
              end
            end

            matched_count.to_f / citation_words.length
          end

          def compute_ngram_overlap(citation_text, segment_text)
            ngram_size = 3
            citation_chars = citation_text.chars
            segment_chars = segment_text.chars
            return 0.0 if citation_chars.empty?

            effective_size = [ngram_size, citation_chars.length].min
            citation_ngrams = citation_chars.each_cons(effective_size).map(&:join)
            segment_ngrams = segment_chars.each_cons(effective_size).map(&:join)
            return 0.0 if citation_ngrams.empty?

            ngram_counts = segment_ngrams.tally
            matched_count = citation_ngrams.count do |ngram|
              if ngram_counts[ngram]&.positive?
                ngram_counts[ngram] -= 1
                true
              end
            end

            matched_count.to_f / citation_ngrams.length
          end
        end
      end
    end
  end
end
