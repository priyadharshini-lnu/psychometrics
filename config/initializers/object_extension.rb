# frozen_string_literal: true

module PrivateAccessors
  def private_attr_accessor(*names)
    attr_accessor *names
    private *names
  end

  def private_attr_reader(*names)
    attr_reader *names
    private *names
  end

  def private_attr_writer(*names)
    attr_writer *names
    names = names.map { |attr| "#{attr}=".to_sym }
    private *names
  end
end

Object.include(PrivateAccessors)
