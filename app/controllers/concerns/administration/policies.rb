# frozen_string_literal: true

# Extend Pundit helper for use in administration namespace
module Administration
  module Policies
    extend ActiveSupport::Concern

    def authorize(record, query = nil, extra = {})
      record = define_scope(record)
      super
    end

    def policy_scope(scope, _extra = {})
      scope = define_scope(scope)
      super(scope)
    end

    def pundit_policy_scope(scope)
      scope = define_scope(scope)
      super
    end

    def policy(record, extra = {})
      record = define_scope(record)
      super
    end

    private

    def define_scope(object)
      if [object].flatten.exclude?(:administration) && [object].flatten.exclude?(:assessors)
        object = [:administration, object].flatten
      end
      object
    end
  end
end
