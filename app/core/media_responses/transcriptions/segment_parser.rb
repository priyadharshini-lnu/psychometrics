# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    class SegmentParser
      # Silence gap (seconds) that triggers a sentence boundary between words
      TIME_GAP_THRESHOLD = 0.6
      # Minimum duration (seconds) before starting a new segment
      TARGET_SEGMENT_DURATION = 10.0
      # Unicode punctuation marks that end a sentence (period, ?, !, Arabic ?, Devanagari danda, CJK period, etc.)
      SENTENCE_TERMINATORS = /[\u002E\u003F\u0021\u061F\u0964\u0965\u3002\uFF01\uFF1F\u037E]\z/
      ATTACH_TO_PREV = /\s+([\u002E\u002C\u003F\u0021\u060C\u061B\u061F\u0964\u0965\u3002\uFF01\uFF1F])/
      # Arabic diacritical marks stripped during normalization for consistent matching
      ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC]/
      # Scripts that don't use spaces between words — triggers n-gram overlap instead of word overlap
      NO_SPACE_SCRIPT = /[\p{Han}\p{Hiragana}\p{Katakana}\p{Thai}]/

      def self.from_oci_tokens(tokens, full_text = nil)
        return [] if tokens.blank?

        words = tokens.filter_map do |token|
          next unless token['type'] == 'WORD'

          {
            raw: token['token'],
            clean: clean(token['token']),
            start: parse_time(token['startTime']),
            end: parse_time(token['endTime'])
          }
        end

        words = restore_punctuation(words, full_text) if full_text.present?
        build_segments(words)
      end

      def self.from_azure_words(words, full_text = nil)
        return [] if words.blank?

        normalized_words = words.map do |word|
          {
            raw: word['word'],
            clean: clean(word['word']),
            start: word['start'].to_f,
            end: word['end'].to_f
          }
        end

        normalized_words = restore_punctuation(normalized_words, full_text) if full_text.present?
        build_segments(normalized_words)
      end

      def self.build_segments(words)
        sentences = split_into_sentences(words)
        chunk_sentences_into_segments(sentences)
      end

      def self.split_into_sentences(words)
        sentences = []
        current_sentence = []
        previous_word = nil

        words.each do |word|
          if sentence_boundary?(previous_word, word) && current_sentence.any?
            sentences << build_sentence(current_sentence)
            current_sentence = []
            previous_word = nil
          end

          current_sentence << word
          previous_word = word
        end

        sentences << build_sentence(current_sentence) if current_sentence.any?
        sentences
      end

      def self.chunk_sentences_into_segments(sentences)
        segments = []
        current_chunk = []
        chunk_start_time = nil

        sentences.each do |sentence|
          chunk_start_time ||= sentence[:start]
          current_chunk << sentence

          next unless past_target_duration?(chunk_start_time, sentence[:end])

          segments << build_segment(current_chunk)
          current_chunk = []
          chunk_start_time = nil
        end

        segments << build_segment(current_chunk) if current_chunk.any?
        segments
      end

      def self.build_sentence(words)
        {
          start: words.first[:start],
          end: words.last[:end],
          text: join_words(words.pluck(:raw))
        }
      end

      def self.build_segment(sentences)
        {
          'start_time' => sentences.first[:start],
          'end_time' => sentences.last[:end],
          'text' => sentences.pluck(:text).join(' ')
        }
      end

      def self.sentence_boundary?(previous_word, current_word)
        return false unless previous_word
        return true  if previous_word[:raw]&.match?(SENTENCE_TERMINATORS)

        (current_word[:start] - previous_word[:end]) > TIME_GAP_THRESHOLD
      end

      def self.past_target_duration?(start_time, end_time)
        (end_time - start_time) >= TARGET_SEGMENT_DURATION
      end

      def self.restore_punctuation(words, full_text)
        punctuated_tokens = full_text.scan(/[\p{L}\p{N}\p{M}'][\p{L}\p{N}\p{M}']*[\p{P}]*/)
        token_index = 0

        words.each do |word|
          break if token_index >= punctuated_tokens.length

          if normalize(word[:clean]) == normalize(punctuated_tokens[token_index])
            word[:raw] = punctuated_tokens[token_index]
            token_index += 1
          end
        end

        words
      end

      def self.clean(word)
        word.to_s.
          unicode_normalize(:nfc).
          gsub(ARABIC_DIACRITICS, '').
          gsub(/[^\p{L}\p{N}']/, '').
          downcase
      end

      def self.normalize(word)
        word.to_s.
          unicode_normalize(:nfc).
          gsub(ARABIC_DIACRITICS, '').
          gsub(/[^\p{L}\p{N}']/, '').
          downcase
      end

      def self.join_words(words)
        words.join(' ').gsub(ATTACH_TO_PREV, '\1')
      end

      def self.parse_time(time)
        return 0.0 if time.blank?

        time.to_s.delete_suffix('s').to_f
      end

      private_class_method :build_segments, :split_into_sentences, :chunk_sentences_into_segments,
                           :build_sentence, :build_segment, :sentence_boundary?,
                           :past_target_duration?, :join_words, :clean, :parse_time,
                           :restore_punctuation, :normalize
    end
  end
end
