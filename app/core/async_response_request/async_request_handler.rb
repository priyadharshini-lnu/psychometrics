# frozen_string_literal: true

class AsyncResponseRequest::AsyncRequestHandler < BaseCommand
  attr_reader :context

  def initialize(context)
    @context = context
  end

  def current_user
    @current_user ||= context[:current_user]
  end

  def params
    context[:params]
  end
end
