# frozen_string_literal: true

class LuaEvaluator
  def self.eval(code, lua = Lua::State.new)
    lua.__load_stdlib :base, :math, :string
    lua.__eval(%(
      arg=nil
      debug=nil
      dofile=nil
      loadfile=nil
      io=nil
      package=nil
      require=nil
    ))
    lua.__eval(code)
  end
end
