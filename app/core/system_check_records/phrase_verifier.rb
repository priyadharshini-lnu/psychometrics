# frozen_string_literal: true

module SystemCheckRecords
  class PhraseVerifier
    Result = Struct.new(
      :matched,
      :score,
      :best_window,
      :details,
      keyword_init: true
    )

    DEFAULT_THRESHOLD = 0.82

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

      best = build_candidate_windows(transcript_tokens, target_tokens.length).
             map { |window| score_window(target_tokens, window) }.
             max_by { |h| h[:score] }

      Result.new(
        matched: best[:score] >= @threshold,
        score: best[:score],
        best_window: best[:candidate_tokens].join(' '),
        details: best.except(:candidate_tokens)
      )
    end

    private

    def empty_result(error)
      Result.new(matched: false, score: 0.0, best_window: nil, details: { error: error })
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

      return [tokens] if min_size > max_size

      (min_size..max_size).flat_map { |size| tokens.each_cons(size).to_a }
    end

    def score_window(target_tokens, candidate_tokens)
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
        candidate_tokens: candidate_tokens
      }
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
