# frozen_string_literal: true

module Forms
  class Base < Reform::Form
    include Reform::Form::ActiveModel::ModelReflections
  end
end
