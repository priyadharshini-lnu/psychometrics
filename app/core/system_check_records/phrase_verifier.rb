# frozen_string_literal: true

module SystemCheckRecords
  class PhraseVerifier
    Result = Struct.new(
      :matched,
      :score,
      :details,
      keyword_init: true
    )

    DEFAULT_THRESHOLD = 0.80
    REQUIRED_WINDOW_COUNT = 3

    COVERAGE_FLOOR     = 0.5
    COVERAGE_FLOOR_CAP = 0.6

    def initialize(target_phrase, transcript, threshold: DEFAULT_THRESHOLD)
      @target_phrase = target_phrase.to_s
      @transcript = transcript.to_s
      @threshold = threshold
    end

    def call
      target_tokens = tokenize(@target_phrase)
      transcript_tokens = tokenize(@transcript)

      return empty_result('Empty target or transcript') if target_tokens.empty? || transcript_tokens.empty?

      scored_windows = build_candidate_windows(transcript_tokens, target_tokens.length).
                       map { |window| score_window(target_tokens, window) }
      selected_windows = select_non_overlapping_windows(scored_windows, required_count: REQUIRED_WINDOW_COUNT)

      average_score = fixed_denominator_average_score(selected_windows)
      has_sufficient_windows = selected_windows.size >= REQUIRED_WINDOW_COUNT

      Result.new(
        matched: has_sufficient_windows && average_score >= @threshold,
        score: average_score.round(4)
      )
    end

    private

    def empty_result(error)
      Result.new(matched: false, score: 0.0, details: { error: error })
    end

    def normalize(text)
      text.downcase.
        gsub(/[^a-z0-9\s]/, ' ').
        gsub(/\s+/, ' ').
        strip
    end

    def tokenize(text)
      normalize(text).split
    end

    def build_candidate_windows(tokens, target_length)
      min_size = [1, target_length - 2].max
      max_size = [tokens.length, target_length + 2].min

      return [{ candidate_tokens: tokens, start_index: 0, end_index: tokens.length - 1 }] if min_size > max_size

      (min_size..max_size).flat_map do |size|
        tokens.each_cons(size).with_index.map do |candidate_tokens, start_index|
          {
            candidate_tokens: candidate_tokens,
            start_index: start_index,
            end_index: start_index + size - 1
          }
        end
      end
    end

    def score_window(target_tokens, window)
      candidate_tokens = window[:candidate_tokens]
      edit_score = normalized_edit_similarity(target_tokens, candidate_tokens)
      coverage = keyword_coverage(target_tokens, candidate_tokens)
      bigram_score = bigram_overlap(target_tokens, candidate_tokens)

      raw_score = (0.6 * edit_score) + (0.25 * coverage) + (0.15 * bigram_score)
      score = coverage < COVERAGE_FLOOR ? [raw_score, COVERAGE_FLOOR_CAP].min : raw_score

      {
        score: score.round(4),
        edit_score: edit_score.round(4),
        coverage: coverage.round(4),
        bigram_score: bigram_score.round(4),
        candidate_tokens: candidate_tokens,
        start_index: window[:start_index],
        end_index: window[:end_index]
      }
    end

    def select_non_overlapping_windows(scored_windows, required_count:)
      highest_scoring_windows = scored_windows.sort_by do |window|
        [-window[:score], window[:start_index], window[:end_index]]
      end

      best_non_overlapping_windows = []
      highest_scoring_windows.each do |window|
        next if overlaps_with_selected?(window, best_non_overlapping_windows)

        best_non_overlapping_windows << window
        break if best_non_overlapping_windows.size == required_count
      end

      best_non_overlapping_windows.sort_by { |window| window[:start_index] }
    end

    def overlaps_with_selected?(window, selected_windows)
      selected_windows.any? do |selected_window|
        ranges_overlap?(window[:start_index], window[:end_index], selected_window[:start_index],
                        selected_window[:end_index])
      end
    end

    def ranges_overlap?(start_a, end_a, start_b, end_b)
      start_a <= end_b && start_b <= end_a
    end

    def fixed_denominator_average_score(selected_windows)
      return 0.0 if selected_windows.empty?

      selected_windows.sum { |window| window[:score] } / REQUIRED_WINDOW_COUNT
    end

    def normalized_edit_similarity(target_tokens, candidate_tokens)
      max_len = [target_tokens.length, candidate_tokens.length].max
      return 1.0 if max_len.zero?

      1.0 - (levenshtein_distance(target_tokens, candidate_tokens).to_f / max_len)
    end

    def levenshtein_distance(target_tokens, candidate_tokens)
      m = target_tokens.length
      n = candidate_tokens.length
      return n if m.zero?
      return m if n.zero?

      dp = Array.new(m + 1) { Array.new(n + 1, 0) }
      (0..m).each { |i| dp[i][0] = i }
      (0..n).each { |j| dp[0][j] = j }

      (1..m).each do |i|
        (1..n).each do |j|
          cost = target_tokens[i - 1] == candidate_tokens[j - 1] ? 0 : 1
          dp[i][j] = [dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost].min
        end
      end

      dp[m][n]
    end

    def keyword_coverage(target_tokens, candidate_tokens)
      return 1.0 if target_tokens.empty?

      matched = target_tokens.count { |token| candidate_tokens.include?(token) }
      matched.to_f / target_tokens.length
    end

    def bigram_overlap(target_tokens, candidate_tokens)
      target_bigrams = target_tokens.each_cons(2).map { |a, b| "#{a} #{b}" }
      candidate_bigrams = candidate_tokens.each_cons(2).map { |a, b| "#{a} #{b}" }

      return 1.0 if target_bigrams.empty? && candidate_bigrams.empty?
      return 0.0 if target_bigrams.empty?

      target_bigrams.count { |bg| candidate_bigrams.include?(bg) }.to_f / target_bigrams.length
    end
  end
end
