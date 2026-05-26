# frozen_string_literal: true

# Disable Falcon's Console gem logging to prevent duplicate logs.
# SemanticLogger already captures all request information.
# Falcon uses the Console gem for request logging, which produces redundant JSON output.
require 'console'

Console.logger = Console::Logger.new(
  Console::Output::Null.new(nil)
)
