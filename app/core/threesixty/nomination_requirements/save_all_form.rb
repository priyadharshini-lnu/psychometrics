# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class SaveAllForm < Rectify::Form
      attribute :nomination_requirements, Array[SaveForm]
    end
  end
end
