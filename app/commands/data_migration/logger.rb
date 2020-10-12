# frozen_string_literal: true

module DataMigration
  class Logger
    attr_accessor :prompt_string, :level, :out

    PROMPT_STRING_LENGTH = 25

    def initialize(context, key, level = 0, out = $stdout)
      @out = out
      @level = level
      @prompt_string = "#{context} (#{key}) "
    end

    def prompt
      [' ' * level, prompt_string].join.ljust(PROMPT_STRING_LENGTH, '-')
    end

    def log(message = nil, level = nil)
      out.puts [level ? ' ' * level : nil, prompt, message].reject(&:nil?).join('> ')
    end
  end
end
