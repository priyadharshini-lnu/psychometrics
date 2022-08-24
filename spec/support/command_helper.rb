# frozen_string_literal: true

class TestCommand < BaseCommand
  def initialize(*args); end
end

module CommandHelper
  def stub_command_broadcast(klass, event_to_publish, *published_event_args)
    stub_const(klass, Class.new(TestCommand) do
      define_method(:call) do |*_|
        publish(event_to_publish, *published_event_args)
      end
    end)
  end
end
