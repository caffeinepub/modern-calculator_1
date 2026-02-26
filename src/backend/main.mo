import Float "mo:core/Float";
import Runtime "mo:core/Runtime";

actor {
  public func add(x : Float, y : Float) : async Float {
    x + y;
  };

  public func subtract(x : Float, y : Float) : async Float {
    x - y;
  };

  public func multiply(x : Float, y : Float) : async Float {
    x * y;
  };

  public func divide(x : Float, y : Float) : async Float {
    if (y == 0) { Runtime.trap("Division by 0 is not allowed.") };
    x / y;
  };

  public func divideSafe(x : Float, y : Float) : async ?Float {
    if (y == 0) { return null };
    ?(x / y);
  };
};
