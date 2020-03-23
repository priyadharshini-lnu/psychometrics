# frozen_string_literal: true

module Assigns
  class SaveGameData < BaseCommand
    private_attr_accessor :assign, :form

    def initialize(assign, form)
      @assign = assign
      @form = form
    end

    def call
      # Code to update assigns
    end
  end
end
