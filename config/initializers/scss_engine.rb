# frozen_string_literal: true

require 'sassc/engine'

module ScssEngine
  def render
    css = super
    return css if Settings.asset_host.blank?

    css.gsub("//#{Settings.asset_host}", '')
  end
end

module SassC
  class Engine
    prepend ScssEngine
  end
end
